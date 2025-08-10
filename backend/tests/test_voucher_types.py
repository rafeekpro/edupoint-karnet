import pytest
from fastapi.testclient import TestClient
from datetime import time
import json

class TestVoucherTypeConfiguration:
    """Tests for voucher type configuration by organization owners"""
    
    def test_create_voucher_type(self, client: TestClient, owner_token: str, org_id: str):
        """Organization owner should be able to create voucher types"""
        voucher_type = {
            "name": "Premium Monthly Pass",
            "session_name": "Therapy Session",
            "total_sessions": 10,
            "backup_sessions": 2,
            "session_duration_minutes": 60,
            "max_clients_per_session": 1,
            "frequency": "weekly",  # weekly, daily, biweekly
            "price": 299.99,
            "validity_days": 30,
            "booking_rules": {
                "monday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "tuesday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "wednesday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "thursday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "friday": {"enabled": True, "start_time": "12:00", "end_time": "15:00"},
                "saturday": {"enabled": False},
                "sunday": {"enabled": False}
            },
            "description": "10 therapy sessions with 2 backup sessions",
            "is_active": True
        }
        
        response = client.post(
            f"/api/organizations/{org_id}/voucher-types",
            json=voucher_type,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 201
        created = response.json()
        assert created["name"] == voucher_type["name"]
        assert created["total_sessions"] == voucher_type["total_sessions"]
        assert created["backup_sessions"] == voucher_type["backup_sessions"]
        assert created["organization_id"] == org_id
        assert "id" in created
        assert created["booking_rules"] == voucher_type["booking_rules"]
    
    def test_list_organization_voucher_types(self, client: TestClient, owner_token: str, org_id: str):
        """Should be able to list all voucher types for an organization"""
        response = client.get(
            f"/api/organizations/{org_id}/voucher-types",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        voucher_types = response.json()
        assert isinstance(voucher_types, list)
        for vt in voucher_types:
            assert vt["organization_id"] == org_id
            assert "name" in vt
            assert "total_sessions" in vt
            assert "price" in vt
    
    def test_update_voucher_type(self, client: TestClient, owner_token: str, org_id: str, voucher_type_id: str):
        """Organization owner should be able to update voucher types"""
        update_data = {
            "name": "Updated Premium Pass",
            "total_sessions": 12,
            "backup_sessions": 3,
            "price": 349.99,
            "booking_rules": {
                "monday": {"enabled": True, "start_time": "09:00", "end_time": "19:00"},
                "tuesday": {"enabled": True, "start_time": "09:00", "end_time": "19:00"},
                "wednesday": {"enabled": True, "start_time": "09:00", "end_time": "19:00"},
                "thursday": {"enabled": True, "start_time": "09:00", "end_time": "19:00"},
                "friday": {"enabled": True, "start_time": "09:00", "end_time": "17:00"},
                "saturday": {"enabled": True, "start_time": "10:00", "end_time": "14:00"},
                "sunday": {"enabled": False}
            }
        }
        
        response = client.put(
            f"/api/organizations/{org_id}/voucher-types/{voucher_type_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        updated = response.json()
        assert updated["name"] == update_data["name"]
        assert updated["total_sessions"] == update_data["total_sessions"]
        assert updated["backup_sessions"] == update_data["backup_sessions"]
        assert updated["price"] == update_data["price"]
        assert updated["booking_rules"]["saturday"]["enabled"] == True
    
    def test_deactivate_voucher_type(self, client: TestClient, owner_token: str, org_id: str, voucher_type_id: str):
        """Organization owner should be able to deactivate voucher types"""
        response = client.put(
            f"/api/organizations/{org_id}/voucher-types/{voucher_type_id}/deactivate",
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 200
        deactivated = response.json()
        assert deactivated["is_active"] == False
        assert deactivated["deactivated_at"] is not None
    
    def test_different_frequency_options(self, client: TestClient, owner_token: str, org_id: str):
        """Test creating voucher types with different frequency options"""
        frequencies = [
            {"frequency": "daily", "name": "Daily Sessions"},
            {"frequency": "weekly", "name": "Weekly Sessions"},
            {"frequency": "biweekly", "name": "Biweekly Sessions"},
            {"frequency": "custom", "name": "Custom Schedule", "custom_days": [1, 3, 5]}  # Mon, Wed, Fri
        ]
        
        for freq_config in frequencies:
            voucher_type = {
                "name": freq_config["name"],
                "session_name": "Session",
                "total_sessions": 5,
                "backup_sessions": 1,
                "session_duration_minutes": 45,
                "max_clients_per_session": 1,
                "frequency": freq_config["frequency"],
                "price": 199.99,
                "validity_days": 30,
                "booking_rules": {
                    "monday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                    "tuesday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                    "wednesday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                    "thursday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                    "friday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                    "saturday": {"enabled": False},
                    "sunday": {"enabled": False}
                }
            }
            
            if "custom_days" in freq_config:
                voucher_type["custom_days"] = freq_config["custom_days"]
            
            response = client.post(
                f"/api/organizations/{org_id}/voucher-types",
                json=voucher_type,
                headers={"Authorization": f"Bearer {owner_token}"}
            )
            assert response.status_code == 201
            created = response.json()
            assert created["frequency"] == freq_config["frequency"]
            if "custom_days" in freq_config:
                assert created["custom_days"] == freq_config["custom_days"]
    
    def test_group_vs_individual_sessions(self, client: TestClient, owner_token: str, org_id: str):
        """Test creating voucher types for group and individual sessions"""
        # Individual session
        individual_voucher = {
            "name": "Individual Therapy",
            "session_name": "1-on-1 Session",
            "total_sessions": 8,
            "backup_sessions": 2,
            "session_duration_minutes": 60,
            "max_clients_per_session": 1,
            "frequency": "weekly",
            "price": 399.99,
            "validity_days": 60,
            "booking_rules": {
                "monday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "tuesday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "wednesday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "thursday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "friday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"},
                "saturday": {"enabled": False},
                "sunday": {"enabled": False}
            }
        }
        
        response = client.post(
            f"/api/organizations/{org_id}/voucher-types",
            json=individual_voucher,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 201
        individual = response.json()
        assert individual["max_clients_per_session"] == 1
        
        # Group session
        group_voucher = {
            "name": "Group Therapy",
            "session_name": "Group Session",
            "total_sessions": 10,
            "backup_sessions": 2,
            "session_duration_minutes": 90,
            "max_clients_per_session": 8,
            "frequency": "weekly",
            "price": 199.99,
            "validity_days": 60,
            "booking_rules": {
                "monday": {"enabled": True, "start_time": "18:00", "end_time": "20:00"},
                "wednesday": {"enabled": True, "start_time": "18:00", "end_time": "20:00"},
                "friday": {"enabled": False},
                "saturday": {"enabled": False},
                "sunday": {"enabled": False},
                "tuesday": {"enabled": False},
                "thursday": {"enabled": False}
            }
        }
        
        response = client.post(
            f"/api/organizations/{org_id}/voucher-types",
            json=group_voucher,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 201
        group = response.json()
        assert group["max_clients_per_session"] == 8
    
    def test_voucher_type_validation(self, client: TestClient, owner_token: str, org_id: str):
        """Test validation rules for voucher types"""
        # Invalid time format
        invalid_voucher = {
            "name": "Invalid Time Format",
            "session_name": "Session",
            "total_sessions": 5,
            "backup_sessions": 1,
            "session_duration_minutes": 60,
            "max_clients_per_session": 1,
            "frequency": "weekly",
            "price": 199.99,
            "validity_days": 30,
            "booking_rules": {
                "monday": {"enabled": True, "start_time": "25:00", "end_time": "20:00"}  # Invalid hour
            }
        }
        
        response = client.post(
            f"/api/organizations/{org_id}/voucher-types",
            json=invalid_voucher,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 422
        
        # Start time after end time
        invalid_voucher2 = {
            "name": "Invalid Time Range",
            "session_name": "Session",
            "total_sessions": 5,
            "backup_sessions": 1,
            "session_duration_minutes": 60,
            "max_clients_per_session": 1,
            "frequency": "weekly",
            "price": 199.99,
            "validity_days": 30,
            "booking_rules": {
                "monday": {"enabled": True, "start_time": "20:00", "end_time": "08:00"}  # Start after end
            }
        }
        
        response = client.post(
            f"/api/organizations/{org_id}/voucher-types",
            json=invalid_voucher2,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 422
        
        # Negative values
        invalid_voucher3 = {
            "name": "Negative Values",
            "session_name": "Session",
            "total_sessions": -5,  # Negative sessions
            "backup_sessions": 1,
            "session_duration_minutes": 60,
            "max_clients_per_session": 1,
            "frequency": "weekly",
            "price": -99.99,  # Negative price
            "validity_days": 30,
            "booking_rules": {
                "monday": {"enabled": True, "start_time": "08:00", "end_time": "20:00"}
            }
        }
        
        response = client.post(
            f"/api/organizations/{org_id}/voucher-types",
            json=invalid_voucher3,
            headers={"Authorization": f"Bearer {owner_token}"}
        )
        assert response.status_code == 422


class TestClientVoucherPurchase:
    """Tests for clients purchasing vouchers"""
    
    def test_list_available_voucher_types(self, client: TestClient, user_token: str):
        """Clients should be able to see available voucher types"""
        response = client.get(
            "/api/voucher-types/available",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 200
        voucher_types = response.json()
        assert isinstance(voucher_types, list)
        # Only active voucher types should be shown
        for vt in voucher_types:
            assert vt["is_active"] == True
            assert "price" in vt
            assert "name" in vt
            assert "description" in vt
    
    def test_purchase_voucher(self, client: TestClient, user_token: str, voucher_type_id: str):
        """Client should be able to purchase a voucher"""
        purchase_data = {
            "voucher_type_id": voucher_type_id,
            "payment_method": "credit_card",  # This would integrate with payment gateway
            "payment_token": "tok_visa_4242"  # Mock payment token
        }
        
        response = client.post(
            "/api/vouchers/purchase",
            json=purchase_data,
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert response.status_code == 201
        voucher = response.json()
        assert voucher["voucher_type_id"] == voucher_type_id
        assert voucher["client_id"] is not None
        assert voucher["purchase_date"] is not None
        assert voucher["valid_until"] is not None
        assert len(voucher["codes"]) > 0
        assert voucher["status"] == "active"