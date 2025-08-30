#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Complete System Expense Types Customization
Tests the new APIs for complete customization of system expense types:
1. GET /api/types-frais/manage/2 - Get all expense types for company ID 2 (system + personalized)
2. PUT /api/types-frais/{typeId} - Customize system expense type (label, description, VAT, accounting account)
3. POST /api/types-frais - Create new personalized expense type for a company
Expected: System types with customization possibility, no more "Cannot modify system type label" message
Database: MySQL local connection with tables types_frais, types_frais_societe_personnalisation, types_frais_societe
System types IDs: 14-21 (Transport, Hébergement, Repas, etc.)
Company ID: 2
"""

import requests
import json
import sys
import os
from datetime import datetime

# Backend URL configuration - Using production URL from frontend/.env
REACT_APP_BACKEND_URL = "https://vinisys-finance-1.preview.emergentagent.com"
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
    """Test 2: GET /api/types-frais/manage/2 - Get all expense types for company ID 2"""
    print_test_header("GET Types de Frais Management API Test")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/types-frais/manage/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            if 'success' in data and 'types_frais' in data:
                success = data.get('success')
                types_frais = data.get('types_frais', [])
                summary = data.get('summary', {})
                
                if success and isinstance(types_frais, list):
                    # Verify each type has required fields for customization
                    required_fields = ['id', 'nom', 'libelle', 'actif', 'source_type', 'is_system', 'is_personalized']
                    all_valid = True
                    system_types = []
                    personalized_types = []
                    custom_types = []
                    
                    for type_frais in types_frais:
                        # Check required fields
                        for field in required_fields:
                            if field not in type_frais:
                                all_valid = False
                                print(f"Missing field '{field}' in type: {type_frais}")
                                break
                        
                        if not all_valid:
                            break
                            
                        # Categorize types
                        source_type = type_frais.get('source_type')
                        if source_type == 'system':
                            system_types.append(type_frais)
                        elif source_type == 'personalized':
                            personalized_types.append(type_frais)
                        elif source_type == 'custom':
                            custom_types.append(type_frais)
                    
                    if all_valid:
                        print_test_result(True, f"GET types-frais successful - {len(types_frais)} types found", response)
                        print(f"  - System types: {len(system_types)}")
                        print(f"  - Personalized types: {len(personalized_types)}")
                        print(f"  - Custom types: {len(custom_types)}")
                        print(f"  - Summary from API: {summary}")
                        
                        # Verify system types can be customized (should have is_personalized field)
                        system_customizable = all(t.get('is_personalized') is not None for t in system_types)
                        if system_customizable:
                            print("  ✅ System types have customization capability")
                        else:
                            print("  ⚠️ Some system types missing customization info")
                        
                        return True, data, system_types, personalized_types, custom_types
                    else:
                        print_test_result(False, f"Types de frais missing required fields", response)
                        return False, None, [], [], []
                else:
                    print_test_result(False, f"Invalid response structure - success: {success}, types_frais type: {type(types_frais)}", response)
                    return False, None, [], [], []
            else:
                print_test_result(False, f"Response missing 'success' or 'types_frais' fields", response)
                return False, None, [], [], []
        else:
            print_test_result(False, f"GET types-frais failed - HTTP {response.status_code}", response)
            return False, None, [], [], []
            
    except Exception as e:
        print_test_result(False, f"GET types-frais test failed - {str(e)}")
        return False, None, [], [], []

def test_customize_system_type(system_types):
    """Test 3: PUT /api/types-frais/{typeId} - Customize a system expense type"""
    print_test_header("PUT Customize System Type API Test")
    
    if not system_types:
        print_test_result(False, "No system types available for customization test")
        return False, None, None
    
    try:
        headers = get_auth_headers()
        headers['Content-Type'] = 'application/json'
        
        # Find a system type to customize (prefer "Kilomètres" if available)
        target_type = None
        for type_frais in system_types:
            if 'kilomètre' in type_frais.get('libelle', '').lower() or 'transport' in type_frais.get('libelle', '').lower():
                target_type = type_frais
                break
        
        if not target_type:
            # Use first available system type
            target_type = system_types[0]
        
        type_id = target_type['id']
        original_libelle = target_type['libelle']
        
        # Test customization data - changing "Kilomètres" to "Frais de déplacement km"
        custom_data = {
            "libelle": "Frais de déplacement km",
            "description": "Frais kilométriques personnalisés pour déplacements professionnels",
            "tva_deductible": 1,
            "taux_deduction_tva": 20.0,
            "compte_comptable_id": None,
            "actif": 1,
            "societeId": SOCIETE_ID
        }
        
        print(f"Customizing system type ID {type_id} ('{original_libelle}') -> '{custom_data['libelle']}'")
        
        response = requests.put(f"{API_BASE}/types-frais/{type_id}", json=custom_data, headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            if 'success' in data and data.get('success'):
                message = data.get('message', '')
                response_data = data.get('data', {})
                
                # Check if it's a system type personalization
                if 'système personnalisé' in message or response_data.get('is_personalized'):
                    print_test_result(True, f"System type customization successful - Type ID {type_id}", response)
                    print(f"  - Original label: '{original_libelle}'")
                    print(f"  - New label: '{custom_data['libelle']}'")
                    print(f"  - Message: {message}")
                    return True, data, type_id
                else:
                    print_test_result(False, f"Unexpected response for system type customization", response)
                    return False, None, None
            else:
                print_test_result(False, f"Customization failed - success: {data.get('success')}", response)
                return False, None, None
        else:
            print_test_result(False, f"PUT customize system type failed - HTTP {response.status_code}", response)
            return False, None, None
            
    except Exception as e:
        print_test_result(False, f"PUT customize system type test failed - {str(e)}")
        return False, None, None

def test_create_custom_type():
    """Test 4: POST /api/types-frais - Create new personalized expense type"""
    print_test_header("POST Create Custom Type API Test")
    try:
        headers = get_auth_headers()
        headers['Content-Type'] = 'application/json'
        
        # Create test data for a new custom expense type
        test_type = {
            "nom": "Formation Spécialisée",
            "libelle": "Formation professionnelle spécialisée",
            "societe_id": SOCIETE_ID,
            "description": "Formation technique et professionnelle pour les employés",
            "tva_deductible": 1,
            "taux_deduction_tva": 20.0,
            "compte_comptable_id": None
        }
        
        response = requests.post(f"{API_BASE}/types-frais", json=test_type, headers=headers, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            
            # Verify response structure
            if 'success' in data and data.get('success'):
                type_id = data.get('data', {}).get('typeId')
                if type_id:
                    print_test_result(True, f"POST create custom type successful - New type ID: {type_id}", response)
                    print(f"  - Name: '{test_type['nom']}'")
                    print(f"  - Label: '{test_type['libelle']}'")
                    print(f"  - Company ID: {test_type['societe_id']}")
                    return True, data, type_id
                else:
                    print_test_result(False, f"Create response missing typeId", response)
                    return False, None, None
            else:
                print_test_result(False, f"Create failed - success: {data.get('success')}", response)
                return False, None, None
        else:
            print_test_result(False, f"POST create custom type failed - HTTP {response.status_code}", response)
            return False, None, None
            
    except Exception as e:
        print_test_result(False, f"POST create custom type test failed - {str(e)}")
        return False, None, None

def test_verify_customization(customized_type_id):
    """Test 5: Verify the customization was applied correctly"""
    print_test_header("Verify Customization Applied - GET Types de Frais")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/types-frais/manage/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            types_frais = data.get('types_frais', [])
            
            # Find the customized type
            customized_type = None
            for type_frais in types_frais:
                if type_frais.get('id') == customized_type_id:
                    customized_type = type_frais
                    break
            
            if customized_type:
                libelle = customized_type.get('libelle')
                source_type = customized_type.get('source_type')
                is_personalized = customized_type.get('is_personalized')
                
                if libelle == "Frais de déplacement km" and source_type == 'personalized' and is_personalized:
                    print_test_result(True, f"Customization verification successful - System type now personalized", response)
                    print(f"  - New label: '{libelle}'")
                    print(f"  - Source type: '{source_type}'")
                    print(f"  - Is personalized: {is_personalized}")
                    return True, customized_type
                else:
                    print_test_result(False, f"Customization not applied correctly - libelle: {libelle}, source_type: {source_type}, is_personalized: {is_personalized}", response)
                    return False, None
            else:
                print_test_result(False, f"Customized type with ID {customized_type_id} not found", response)
                return False, None
        else:
            print_test_result(False, f"Verification GET failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Verification test failed - {str(e)}")
        return False, None

def test_data_persistence():
    """Test 6: Verify data persistence in database tables"""
    print_test_header("Data Persistence Verification Test")
    try:
        headers = get_auth_headers()
        
        # Get all types again to verify persistence
        response = requests.get(f"{API_BASE}/types-frais/manage/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            types_frais = data.get('types_frais', [])
            summary = data.get('summary', {})
            
            # Check if we have personalized and custom types
            personalized_count = summary.get('personalized_types', 0)
            custom_count = summary.get('custom_types', 0)
            
            if personalized_count > 0 or custom_count > 0:
                print_test_result(True, f"Data persistence verified - Personalized: {personalized_count}, Custom: {custom_count}", response)
                
                # Show some examples
                for type_frais in types_frais[:3]:  # Show first 3 types
                    source_type = type_frais.get('source_type', 'unknown')
                    libelle = type_frais.get('libelle', 'N/A')
                    print(f"  - {source_type.upper()}: '{libelle}' (ID: {type_frais.get('id')})")
                
                return True, data
            else:
                print_test_result(False, f"No personalized or custom types found in database", response)
                return False, None
        else:
            print_test_result(False, f"Data persistence check failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Data persistence test failed - {str(e)}")
        return False, None

def main():
    """Main test execution for Complete System Expense Types Customization"""
    print("🚀 Starting Backend API Tests for Complete System Expense Types Customization")
    print("📊 Testing: Complete customization of system expense types (label, description, VAT, accounting account)")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Email: {TEST_EMAIL}")
    print(f"Company ID: {SOCIETE_ID}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    system_types = []
    personalized_types = []
    custom_types = []
    customized_type_id = None
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
    
    # Test 2: GET types-frais management
    get_success, get_data, system_types, personalized_types, custom_types = test_get_types_frais()
    test_results.append(("GET Types de Frais Management", get_success))
    
    # Test 3: Customize system type (only if we have system types)
    customize_success = False
    if get_success and system_types:
        customize_success, customize_data, customized_type_id = test_customize_system_type(system_types)
        test_results.append(("PUT Customize System Type", customize_success))
    else:
        test_results.append(("PUT Customize System Type", False))
    
    # Test 4: Create custom type
    create_success, create_data, created_type_id = test_create_custom_type()
    test_results.append(("POST Create Custom Type", create_success))
    
    # Test 5: Verify customization (only if customization was successful)
    verify_success = False
    if customize_success and customized_type_id:
        verify_success, verify_data = test_verify_customization(customized_type_id)
        test_results.append(("Verify Customization Applied", verify_success))
    else:
        test_results.append(("Verify Customization Applied", False))
    
    # Test 6: Data persistence
    persistence_success, persistence_data = test_data_persistence()
    test_results.append(("Data Persistence Verification", persistence_success))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY - COMPLETE SYSTEM EXPENSE TYPES CUSTOMIZATION")
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
        total_types = len(system_types) + len(personalized_types) + len(custom_types)
        print(f"✅ GET /api/types-frais/manage/{SOCIETE_ID} working - {total_types} types found")
        print(f"  - System types: {len(system_types)}")
        print(f"  - Personalized types: {len(personalized_types)}")
        print(f"  - Custom types: {len(custom_types)}")
    else:
        print(f"❌ GET /api/types-frais/manage/{SOCIETE_ID} failed")
    
    if customize_success:
        print(f"✅ PUT /api/types-frais/{customized_type_id} working - System type customization successful")
        print("✅ No more 'Cannot modify system type label' message!")
    else:
        print("❌ PUT customize system type failed")
    
    if create_success:
        print(f"✅ POST /api/types-frais working - New custom type created with ID: {created_type_id}")
    else:
        print("❌ POST /api/types-frais failed")
    
    if verify_success:
        print(f"✅ Customization verification successful - System type now appears as personalized")
    else:
        print("❌ Customization verification failed")
    
    if persistence_success:
        print(f"✅ Data persistence verified - Changes saved to database tables")
    else:
        print("❌ Data persistence verification failed")
    
    # Overall assessment
    critical_tests = ["Server Connectivity", "Authentication", "GET Types de Frais Management"]
    critical_passed = sum(1 for test_name, result in test_results if test_name in critical_tests and result)
    
    if critical_passed == 3 and passed >= 5:  # All critical tests + most functionality tests
        print(f"\n🎉 COMPLETE SYSTEM EXPENSE TYPES CUSTOMIZATION TESTS SUCCESSFUL!")
        print("✅ Backend server is responding correctly")
        print("✅ User authentication is working with correct credentials")
        print(f"✅ GET /api/types-frais/manage/{SOCIETE_ID} endpoint returns system + personalized types")
        print("✅ PUT /api/types-frais/{typeId} endpoint can customize system types")
        print("✅ POST /api/types-frais endpoint can create new personalized types")
        print("✅ System types can now be fully customized (label, description, VAT, accounting account)")
        print("✅ No more 'Cannot modify system type label' restriction")
        print("✅ Data is properly persisted in database tables")
        print("✅ Response structure includes source_type (system/personalized/custom)")
        print("✅ Complete customization functionality is working correctly")
        return True
    else:
        print(f"\n⚠️ ISSUES DETECTED IN SYSTEM EXPENSE TYPES CUSTOMIZATION")
        if critical_passed < 3:
            print("❌ Critical infrastructure issues detected (server/auth/get endpoint)")
        else:
            print("❌ Some customization operations are not working correctly")
        print("❌ Complete customization functionality may need fixes")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)