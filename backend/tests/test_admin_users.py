import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import json

# Test User Administration

class TestUserAdministration:
    """Tests for admin user CRUD operations"""
    
    def test_admin_can_list_all_users(self, client: TestClient, admin_token: str):
        """Admin should be able to list all users in the system"""
        response = client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) > 0
        # Check user structure
        user = users[0]
        assert "id" in user
        assert "email" in user
        assert "name" in user
        assert "organization_id" in user
        assert "role" in user
        assert "is_active" in user
        assert "created_at" in user
    
    def test_admin_can_create_user(self, client: TestClient, admin_token: str):
        """Admin should be able to create a new user"""
        new_user = {
            "email": "newuser@example.com",
            "name": "New User",
            "password": "SecurePass123!",
            "role": "organization_owner",
            "organization_name": "Test Company"
        }
        response = client.post(
            "/api/admin/users",
            json=new_user,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 201
        created_user = response.json()
        assert created_user["email"] == new_user["email"]
        assert created_user["name"] == new_user["name"]
        assert "organization_id" in created_user
        assert "id" in created_user
        # Password should not be returned
        assert "password" not in created_user
        assert "password_hash" not in created_user
    
    def test_admin_can_update_user(self, client: TestClient, admin_token: str, test_user_id: str):
        """Admin should be able to update user details"""
        update_data = {
            "name": "Updated Name",
            "email": "updated@example.com",
            "is_active": False
        }
        response = client.put(
            f"/api/admin/users/{test_user_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        updated_user = response.json()
        assert updated_user["name"] == update_data["name"]
        assert updated_user["email"] == update_data["email"]
        assert updated_user["is_active"] == update_data["is_active"]
    
    def test_admin_can_change_user_password(self, client: TestClient, admin_token: str, test_user_id: str):
        """Admin should be able to change user's password"""
        new_password = {
            "password": "NewSecurePass456!"
        }
        response = client.put(
            f"/api/admin/users/{test_user_id}/password",
            json=new_password,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "Password updated successfully"
    
    def test_admin_can_delete_user(self, client: TestClient, admin_token: str, test_user_id: str):
        """Admin should be able to delete a user"""
        response = client.delete(
            f"/api/admin/users/{test_user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "User deleted successfully"
        
        # Verify user is deleted
        response = client.get(
            f"/api/admin/users/{test_user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
    
    def test_admin_can_approve_user(self, client: TestClient, admin_token: str, pending_user_id: str):
        """Admin should be able to approve pending users"""
        response = client.post(
            f"/api/admin/users/{pending_user_id}/approve",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        approved_user = response.json()
        assert approved_user["is_active"] == True
        assert approved_user["approved_at"] is not None
        assert approved_user["approved_by"] is not None
    
    def test_non_admin_cannot_access_user_management(self, client: TestClient, user_token: str):
        """Non-admin users should not be able to access user management"""
        response = client.get(
            "/api/admin/users",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 403
        assert "Not authorized" in response.json()["detail"]


class TestOrganizationManagement:
    """Tests for organization management"""
    
    def test_create_organization_with_owner(self, client: TestClient, admin_token: str):
        """Creating an organization should assign an owner"""
        org_data = {
            "name": "Tech Solutions Inc",
            "owner_email": "owner@techsolutions.com",
            "owner_name": "John Owner",
            "owner_password": "SecureOwner123!",
            "address": "123 Tech Street",
            "phone": "+1234567890",
            "tax_id": "12-3456789"
        }
        response = client.post(
            "/api/admin/organizations",
            json=org_data,
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 201
        org = response.json()
        assert org["name"] == org_data["name"]
        assert org["owner"]["email"] == org_data["owner_email"]
        assert org["owner"]["role"] == "organization_owner"
        assert "id" in org
        assert "created_at" in org
    
    def test_organization_owner_can_add_users(self, client: TestClient, owner_token: str, org_id: str):
        """Organization owner should be able to add users to their organization"""
        new_member = {
            "email": "employee@company.com",
            "name": "Employee Name",
            "password": "EmpPass123!",
            "role": "therapist"
        }
        response = client.post(
            f"/api/organizations/{org_id}/users",
            json=new_member,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 201
        member = response.json()
        assert member["email"] == new_member["email"]
        assert member["organization_id"] == org_id
        assert member["role"] == new_member["role"]
    
    def test_organization_owner_cannot_add_users_to_other_org(self, client: TestClient, owner_token: str, other_org_id: str):
        """Organization owner should not be able to add users to other organizations"""
        new_member = {
            "email": "hacker@evil.com",
            "name": "Hacker",
            "password": "HackPass123!",
            "role": "therapist"
        }
        response = client.post(
            f"/api/organizations/{other_org_id}/users",
            json=new_member,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 403
        assert "Not authorized" in response.json()["detail"]
    
    def test_list_organization_users(self, client: TestClient, owner_token: str, org_id: str):
        """Organization owner should be able to list their organization's users"""
        response = client.get(
            f"/api/organizations/{org_id}/users",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        # All users should belong to the same organization
        for user in users:
            assert user["organization_id"] == org_id
    
    def test_update_organization_details(self, client: TestClient, owner_token: str, org_id: str):
        """Organization owner should be able to update organization details"""
        update_data = {
            "name": "Updated Tech Solutions",
            "address": "456 New Tech Avenue",
            "phone": "+9876543210"
        }
        response = client.put(
            f"/api/organizations/{org_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        updated_org = response.json()
        assert updated_org["name"] == update_data["name"]
        assert updated_org["address"] == update_data["address"]
        assert updated_org["phone"] == update_data["phone"]