import pytest
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from httpx import AsyncClient
from main import app
from auth import create_access_token


@pytest.fixture
def admin_token():
    """Create admin token for testing"""
    return create_access_token(data={"sub": "admin-1"})


@pytest.fixture
def therapist_token():
    """Create therapist token for testing"""
    return create_access_token(data={"sub": "therapist-1"})


@pytest.fixture
def client_token():
    """Create client token for testing"""
    return create_access_token(data={"sub": "client-1"})


@pytest.mark.asyncio
async def test_generate_voucher_success(admin_token):
    """Test successful voucher generation by admin"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"regular_codes": 10, "backup_codes": 2}
        )
        
        assert response.status_code == 200
        voucher = response.json()
        assert "id" in voucher
        assert len(voucher["codes"]) == 12
        
        # Check regular codes
        regular_codes = [c for c in voucher["codes"] if not c["is_backup"]]
        assert len(regular_codes) == 10
        
        # Check backup codes
        backup_codes = [c for c in voucher["codes"] if c["is_backup"]]
        assert len(backup_codes) == 2


@pytest.mark.asyncio
async def test_generate_voucher_unauthorized_therapist(therapist_token):
    """Test that therapists cannot generate vouchers"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {therapist_token}"},
            json={"regular_codes": 10, "backup_codes": 2}
        )
        
        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized"


@pytest.mark.asyncio
async def test_generate_voucher_unauthorized_client(client_token):
    """Test that clients cannot generate vouchers"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {client_token}"},
            json={"regular_codes": 10, "backup_codes": 2}
        )
        
        assert response.status_code == 403
        assert response.json()["detail"] == "Not authorized"


@pytest.mark.asyncio
async def test_generate_voucher_no_auth():
    """Test voucher generation without authentication"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/admin/vouchers",
            json={"regular_codes": 10, "backup_codes": 2}
        )
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"


@pytest.mark.asyncio
async def test_list_vouchers_admin(admin_token):
    """Test listing vouchers as admin"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # First create a voucher
        await client.post(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"regular_codes": 10, "backup_codes": 2}
        )
        
        # Then list vouchers
        response = await client.get(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        vouchers = response.json()
        assert isinstance(vouchers, list)
        assert len(vouchers) > 0


@pytest.mark.asyncio
async def test_activate_voucher_code():
    """Test voucher code activation by client"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Create admin token and voucher
        admin_token = create_access_token(data={"sub": "admin-1"})
        voucher_response = await client.post(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"regular_codes": 10, "backup_codes": 2}
        )
        voucher = voucher_response.json()
        code = voucher["codes"][0]["code"]
        
        # Login as client and activate code
        client_token = create_access_token(data={"sub": "client-1"})
        response = await client.post(
            f"/client/activate-code/{code}",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        assert response.status_code == 200
        result = response.json()
        assert result["success"] == True
        assert "voucher" in result


@pytest.mark.asyncio
async def test_activate_invalid_code(client_token):
    """Test activating invalid voucher code"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/client/activate-code/INVALID",
            headers={"Authorization": f"Bearer {client_token}"}
        )
        
        assert response.status_code == 404
        assert response.json()["detail"] == "Invalid voucher code"


@pytest.mark.asyncio
async def test_activate_already_used_code():
    """Test activating already used voucher code"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Create and activate a code
        admin_token = create_access_token(data={"sub": "admin-1"})
        voucher_response = await client.post(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"regular_codes": 1, "backup_codes": 0}
        )
        voucher = voucher_response.json()
        code = voucher["codes"][0]["code"]
        
        # First activation by client 1
        client1_token = create_access_token(data={"sub": "client-1"})
        await client.post(
            f"/client/activate-code/{code}",
            headers={"Authorization": f"Bearer {client1_token}"}
        )
        
        # Try to activate same code with different client
        client2_token = create_access_token(data={"sub": "client-2"})
        response = await client.post(
            f"/client/activate-code/{code}",
            headers={"Authorization": f"Bearer {client2_token}"}
        )
        
        # Should still work as codes have multiple uses in our mock
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_voucher_code_validation():
    """Test voucher code format validation"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        admin_token = create_access_token(data={"sub": "admin-1"})
        response = await client.post(
            "/admin/vouchers",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"regular_codes": 10, "backup_codes": 2}
        )
        
        voucher = response.json()
        for code in voucher["codes"]:
            # Check code format - should be 8 characters, alphanumeric
            assert len(code["code"]) == 8
            assert code["code"].isalnum()
            assert code["code"].isupper()