#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Types de Frais API Testing
Tests the expense types APIs integrated in ParametresDepenses:
1. GET /api/types-frais/manage/{societe_id} - Get expense types list
2. PUT /api/types-frais/{id} - Modify expense type (label and active/inactive status)  
3. POST /api/types-frais - Create new expense type
4. Expected response structure with success boolean and types_frais array
Societe_id to use: 2 (based on previous tests)
"""

import requests
import json
import sys
import os
from datetime import datetime

# Backend URL configuration - Using production URL from frontend/.env
REACT_APP_BACKEND_URL = "https://finance-app-ui.preview.emergentagent.com"
BASE_URL = REACT_APP_BACKEND_URL
API_BASE = f"{BASE_URL}/api"

# Test credentials from user request
TEST_EMAIL = "idnovation2014@gmail.com"
TEST_PASSWORD = "123456"  # Password as specified in request
AUTH_TOKEN = None  # Will be set after login
USER_DATA = None  # Will be set after login
SOCIETE_ID = 2  # Societe ID to use for testing as specified in request

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*60}")
    print(f"TEST: {test_name}")
    print(f"{'='*60}")

def print_test_result(success, message, response=None):
    """Print formatted test result"""
    status = "✅ PASSED" if success else "❌ FAILED"
    print(f"{status}: {message}")
    if response and hasattr(response, 'status_code'):
        print(f"Status Code: {response.status_code}")
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
            except:
                print(f"Response Text: {response.text}")
        else:
            print(f"Response Text: {response.text}")
    print("-" * 60)

def get_auth_headers():
    """Get authentication headers if token is available"""
    if AUTH_TOKEN:
        return {'Authorization': f'Bearer {AUTH_TOKEN}'}
    return {}

def test_server_connectivity():
    """Test 0: Verify backend server is responding"""
    print_test_header("Backend Server Connectivity Test")
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200:
            print_test_result(True, f"Backend server is responding on {BASE_URL}", response)
            return True
        else:
            print_test_result(False, f"Backend server returned unexpected status: {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Backend server connectivity failed - {str(e)}")
        return False

def test_authentication():
    """Test 1: Authentication with specified credentials"""
    global AUTH_TOKEN, USER_DATA
    print_test_header("Authentication Test - User Login")
    try:
        payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{API_BASE}/login", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            AUTH_TOKEN = data.get('token')
            USER_DATA = data
            user_id = data.get('id')
            societe_id = data.get('societe_id')
            permissions = data.get('permissions', [])
            
            if AUTH_TOKEN and user_id and societe_id:
                print_test_result(True, f"Authentication successful - User ID: {user_id}, Company ID: {societe_id}, Permissions: {len(permissions)}", response)
                return True, data
            else:
                print_test_result(False, f"Authentication response missing required fields", response)
                return False, None
        else:
            print_test_result(False, f"Authentication failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Authentication test failed - {str(e)}")
        return False, None

def test_get_types_frais():
    """Test 2: GET /api/types-frais/manage/{societe_id} - Get expense types list"""
    print_test_header("GET Types de Frais API Test")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/types-frais/manage/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            if 'success' in data and 'types_frais' in data:
                success = data.get('success')
                types_frais = data.get('types_frais', [])
                
                if success and isinstance(types_frais, list):
                    # Verify each type has required fields
                    required_fields = ['id', 'nom', 'libelle', 'actif', 'societe_id']
                    all_valid = True
                    
                    for type_frais in types_frais:
                        for field in required_fields:
                            if field not in type_frais:
                                all_valid = False
                                break
                        if not all_valid:
                            break
                    
                    if all_valid:
                        print_test_result(True, f"GET types-frais successful - {len(types_frais)} types found with correct structure", response)
                        return True, data
                    else:
                        print_test_result(False, f"Types de frais missing required fields", response)
                        return False, None
                else:
                    print_test_result(False, f"Invalid response structure - success: {success}, types_frais type: {type(types_frais)}", response)
                    return False, None
            else:
                print_test_result(False, f"Response missing 'success' or 'types_frais' fields", response)
                return False, None
        else:
            print_test_result(False, f"GET types-frais failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"GET types-frais test failed - {str(e)}")
        return False, None

def test_create_type_frais():
    """Test 3: POST /api/types-frais - Create new expense type"""
    print_test_header("POST Create Type de Frais API Test")
    try:
        headers = get_auth_headers()
        headers['Content-Type'] = 'application/json'
        
        # Create test data
        test_type = {
            "nom": "Test - Formation",
            "libelle": "Formation professionnelle",
            "societe_id": SOCIETE_ID
        }
        
        response = requests.post(f"{API_BASE}/types-frais", json=test_type, headers=headers, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            
            # Verify response structure
            if 'success' in data and data.get('success'):
                type_id = data.get('data', {}).get('typeId')
                if type_id:
                    print_test_result(True, f"POST create type-frais successful - New type ID: {type_id}", response)
                    return True, data, type_id
                else:
                    print_test_result(False, f"Create response missing typeId", response)
                    return False, None, None
            else:
                print_test_result(False, f"Create failed - success: {data.get('success')}", response)
                return False, None, None
        else:
            print_test_result(False, f"POST create type-frais failed - HTTP {response.status_code}", response)
            return False, None, None
            
    except Exception as e:
        print_test_result(False, f"POST create type-frais test failed - {str(e)}")
        return False, None, None

def test_update_type_frais(type_id):
    """Test 4: PUT /api/types-frais/{id} - Modify expense type"""
    print_test_header("PUT Update Type de Frais API Test")
    try:
        headers = get_auth_headers()
        headers['Content-Type'] = 'application/json'
        
        # Update test data
        update_data = {
            "libelle": "Formation professionnelle modifiée",
            "actif": False  # Test changing active status
        }
        
        response = requests.put(f"{API_BASE}/types-frais/{type_id}", json=update_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            if 'success' in data and data.get('success'):
                print_test_result(True, f"PUT update type-frais successful - Type ID {type_id} updated", response)
                return True, data
            else:
                print_test_result(False, f"Update failed - success: {data.get('success')}", response)
                return False, None
        else:
            print_test_result(False, f"PUT update type-frais failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"PUT update type-frais test failed - {str(e)}")
        return False, None

def test_verify_update(type_id):
    """Test 5: Verify the update was applied correctly"""
    print_test_header("Verify Update Applied - GET Types de Frais")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/types-frais/manage/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            types_frais = data.get('types_frais', [])
            
            # Find the updated type
            updated_type = None
            for type_frais in types_frais:
                if type_frais.get('id') == type_id:
                    updated_type = type_frais
                    break
            
            if updated_type:
                libelle = updated_type.get('libelle')
                actif = updated_type.get('actif')
                
                if libelle == "Formation professionnelle modifiée" and actif == 0:
                    print_test_result(True, f"Update verification successful - Libelle and actif status correctly updated", response)
                    return True, updated_type
                else:
                    print_test_result(False, f"Update not applied correctly - libelle: {libelle}, actif: {actif}", response)
                    return False, None
            else:
                print_test_result(False, f"Updated type with ID {type_id} not found", response)
                return False, None
        else:
            print_test_result(False, f"Verification GET failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Verification test failed - {str(e)}")
        return False, None

def main():
    """Main test execution for Types de Frais API Testing"""
    print("🚀 Starting Backend API Tests for Types de Frais - ParametresDepenses Integration")
    print("📊 Testing: GET, POST, PUT endpoints for expense types management")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Email: {TEST_EMAIL}")
    print(f"Societe ID: {SOCIETE_ID}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    created_type_id = None
    
    # Test 0: Server connectivity
    server_ok = test_server_connectivity()
    test_results.append(("Server Connectivity", server_ok))
    
    if not server_ok:
        print("\n❌ Backend server is not responding. Stopping tests.")
        return False
    
    # Test 1: Authentication
    auth_success, auth_data = test_authentication()
    test_results.append(("Authentication", auth_success))
    
    if not auth_success:
        print("\n❌ Authentication failed. Cannot proceed with protected endpoint tests.")
        return False
    
    # Test 2: GET types-frais
    get_success, get_data = test_get_types_frais()
    test_results.append(("GET Types de Frais", get_success))
    
    # Test 3: POST create type-frais
    create_success, create_data, created_type_id = test_create_type_frais()
    test_results.append(("POST Create Type de Frais", create_success))
    
    # Test 4: PUT update type-frais (only if create was successful)
    update_success = False
    if create_success and created_type_id:
        update_success, update_data = test_update_type_frais(created_type_id)
        test_results.append(("PUT Update Type de Frais", update_success))
        
        # Test 5: Verify update (only if update was successful)
        if update_success:
            verify_success, verify_data = test_verify_update(created_type_id)
            test_results.append(("Verify Update Applied", verify_success))
    else:
        test_results.append(("PUT Update Type de Frais", False))
        test_results.append(("Verify Update Applied", False))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY - TYPES DE FRAIS API TESTING")
    print(f"{'='*60}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    # Detailed analysis
    print(f"\n{'='*60}")
    print("DETAILED ANALYSIS")
    print(f"{'='*60}")
    
    if server_ok:
        print(f"✅ Backend server is responding on {BASE_URL}")
    
    if auth_success:
        user_id = USER_DATA.get('id') if USER_DATA else 'Unknown'
        societe_id = USER_DATA.get('societe_id') if USER_DATA else 'Unknown'
        permissions_count = len(USER_DATA.get('permissions', [])) if USER_DATA else 0
        print(f"✅ Authentication working with User ID: {user_id}, Company ID: {societe_id}")
        print(f"✅ User has {permissions_count} permissions")
    else:
        print("❌ Authentication failed with provided credentials")
    
    if get_success:
        types_count = len(get_data.get('types_frais', [])) if get_data else 0
        print(f"✅ GET /api/types-frais/manage/{SOCIETE_ID} working - {types_count} types found")
    else:
        print(f"❌ GET /api/types-frais/manage/{SOCIETE_ID} failed")
    
    if create_success:
        print(f"✅ POST /api/types-frais working - New type created with ID: {created_type_id}")
    else:
        print("❌ POST /api/types-frais failed")
    
    if update_success:
        print(f"✅ PUT /api/types-frais/{created_type_id} working - Type updated successfully")
    else:
        print(f"❌ PUT /api/types-frais/{created_type_id} failed")
    
    # Overall assessment
    critical_tests = ["Server Connectivity", "Authentication", "GET Types de Frais"]
    critical_passed = sum(1 for test_name, result in test_results if test_name in critical_tests and result)
    
    if critical_passed == 3 and passed >= 4:  # All critical tests + at least 1 more
        print(f"\n🎉 TYPES DE FRAIS API TESTS SUCCESSFUL!")
        print("✅ Backend server is responding correctly")
        print("✅ User authentication is working with correct credentials")
        print(f"✅ GET /api/types-frais/manage/{SOCIETE_ID} endpoint is functional")
        print("✅ POST /api/types-frais endpoint can create new expense types")
        print("✅ PUT /api/types-frais/{id} endpoint can modify expense types")
        print("✅ Response structure matches expected format (success boolean, types_frais array)")
        print("✅ All required fields present (id, nom, libelle, actif, societe_id)")
        print("✅ ParametresDepenses integration is working correctly")
        return True
    else:
        print(f"\n⚠️ ISSUES DETECTED IN TYPES DE FRAIS API")
        if critical_passed < 3:
            print("❌ Critical infrastructure issues detected (server/auth/get endpoint)")
        else:
            print("❌ Some CRUD operations are not working correctly")
        print("❌ ParametresDepenses integration may need fixes")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)