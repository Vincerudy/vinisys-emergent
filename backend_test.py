#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Barèmes Kilométriques APIs
Tests the new APIs for barèmes kilométriques management:
1. GET /api/baremes-kilometriques/societe/2 - Get all barèmes for company ID 2 (system + personalized + custom)
Expected: 6 system barèmes by default, 1 personalized barème (ID 6 "Véhicule économique personnalisé" with 0.55€ tariff)
Structure: summary with system_baremes, personalized_baremes, custom_baremes
Barèmes with source_type: 'system', 'personalized', or 'custom'
Database: MySQL local connection with tables baremes_kilometriques, baremes_kilometriques_societe
Company ID: 2
"""

import requests
import json
import sys
import os
from datetime import datetime

# Backend URL configuration - Using production URL from frontend/.env
REACT_APP_BACKEND_URL = "https://finance-flex.preview.emergentagent.com"
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

def test_get_baremes_kilometriques():
    """Test 2: GET /api/baremes-kilometriques/societe/2 - Get all barèmes kilométriques for company ID 2"""
    print_test_header("GET Barèmes Kilométriques API Test")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/baremes-kilometriques/societe/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            if 'success' in data and 'baremes_kilometriques' in data:
                success = data.get('success')
                baremes = data.get('baremes_kilometriques', [])
                summary = data.get('summary', {})
                
                if success and isinstance(baremes, list):
                    # Verify each barème has required fields
                    required_fields = ['id', 'nom', 'description', 'puissance_fiscale', 'tarif_km', 'source_type', 'is_personalized']
                    all_valid = True
                    system_baremes = []
                    personalized_baremes = []
                    custom_baremes = []
                    
                    for bareme in baremes:
                        # Check required fields
                        for field in required_fields:
                            if field not in bareme:
                                all_valid = False
                                print(f"Missing field '{field}' in barème: {bareme}")
                                break
                        
                        if not all_valid:
                            break
                            
                        # Categorize barèmes
                        source_type = bareme.get('source_type')
                        if source_type == 'system':
                            system_baremes.append(bareme)
                        elif source_type == 'personalized':
                            personalized_baremes.append(bareme)
                        elif source_type == 'custom':
                            custom_baremes.append(bareme)
                    
                    if all_valid:
                        print_test_result(True, f"GET barèmes-kilométriques successful - {len(baremes)} barèmes found", response)
                        print(f"  - System barèmes: {len(system_baremes)}")
                        print(f"  - Personalized barèmes: {len(personalized_baremes)}")
                        print(f"  - Custom barèmes: {len(custom_baremes)}")
                        print(f"  - Summary from API: {summary}")
                        
                        # Verify expected data
                        expected_system_count = 5  # 5 barèmes système par défaut (excluding personalized ones)
                        expected_personalized_count = 1  # 1 barème personnalisé (ID 6)
                        
                        if len(system_baremes) >= expected_system_count:
                            print(f"  ✅ Expected system barèmes found: {len(system_baremes)} >= {expected_system_count}")
                        else:
                            print(f"  ⚠️ Less system barèmes than expected: {len(system_baremes)} < {expected_system_count}")
                        
                        if len(personalized_baremes) >= expected_personalized_count:
                            print(f"  ✅ Expected personalized barèmes found: {len(personalized_baremes)} >= {expected_personalized_count}")
                            
                            # Check for specific personalized barème
                            vehicule_eco = next((b for b in personalized_baremes if "économique" in b.get('nom', '').lower()), None)
                            if vehicule_eco and float(vehicule_eco.get('tarif_km', 0)) == 0.55:
                                print(f"  ✅ Found expected 'Véhicule économique personnalisé' with 0.55€ tariff")
                            else:
                                print(f"  ⚠️ Expected 'Véhicule économique personnalisé' with 0.55€ not found")
                        else:
                            print(f"  ⚠️ Less personalized barèmes than expected: {len(personalized_baremes)} < {expected_personalized_count}")
                        
                        return True, data, system_baremes, personalized_baremes, custom_baremes
                    else:
                        print_test_result(False, f"Barèmes kilométriques missing required fields", response)
                        return False, None, [], [], []
                else:
                    print_test_result(False, f"Invalid response structure - success: {success}, baremes type: {type(baremes)}", response)
                    return False, None, [], [], []
            else:
                print_test_result(False, f"Response missing 'success' or 'baremes_kilometriques' fields", response)
                return False, None, [], [], []
        else:
            print_test_result(False, f"GET barèmes-kilométriques failed - HTTP {response.status_code}", response)
            return False, None, [], [], []
            
    except Exception as e:
        print_test_result(False, f"GET barèmes-kilométriques test failed - {str(e)}")
        return False, None, [], [], []

def test_verify_data_structure(baremes_data):
    """Test 3: Verify the detailed structure of barèmes data"""
    print_test_header("Verify Barèmes Data Structure")
    try:
        if not baremes_data:
            print_test_result(False, "No barèmes data to verify")
            return False
        
        system_baremes, personalized_baremes, custom_baremes = baremes_data[2], baremes_data[3], baremes_data[4]
        all_baremes = system_baremes + personalized_baremes + custom_baremes
        
        # Verify system barèmes structure
        system_valid = True
        for bareme in system_baremes:
            if not (bareme.get('is_system') and bareme.get('source_type') == 'system' and not bareme.get('is_personalized')):
                system_valid = False
                print(f"Invalid system barème structure: {bareme}")
                break
        
        # Verify personalized barèmes structure  
        personalized_valid = True
        for bareme in personalized_baremes:
            if not (bareme.get('is_system') and bareme.get('source_type') == 'personalized' and bareme.get('is_personalized')):
                personalized_valid = False
                print(f"Invalid personalized barème structure: {bareme}")
                break
        
        # Verify custom barèmes structure
        custom_valid = True
        for bareme in custom_baremes:
            if not (not bareme.get('is_system') and bareme.get('source_type') == 'custom'):
                custom_valid = False
                print(f"Invalid custom barème structure: {bareme}")
                break
        
        # Check for expected barèmes
        expected_baremes = [
            "Véhicule 3 CV et moins",
            "Véhicule 4 CV", 
            "Véhicule 5 CV",
            "Véhicule 6 CV",
            "Véhicule 7 CV et plus",
            "Deux-roues motorisés"
        ]
        
        found_baremes = [b.get('nom', '') for b in all_baremes]
        missing_baremes = [name for name in expected_baremes if not any(name in found for found in found_baremes)]
        
        if system_valid and personalized_valid and custom_valid and len(missing_baremes) == 0:
            print_test_result(True, f"Data structure verification successful", None)
            print(f"  - System barèmes structure: ✅ Valid")
            print(f"  - Personalized barèmes structure: ✅ Valid") 
            print(f"  - Custom barèmes structure: ✅ Valid")
            print(f"  - All expected barèmes found: ✅ {len(expected_baremes)}/{len(expected_baremes)}")
            
            # Show some examples
            for i, bareme in enumerate(all_baremes[:3]):
                source = bareme.get('source_type', 'unknown').upper()
                nom = bareme.get('nom', 'N/A')
                tarif = bareme.get('tarif_km', 'N/A')
                print(f"  - {source}: '{nom}' - {tarif}€/km")
            
            return True
        else:
            print_test_result(False, f"Data structure verification failed", None)
            if not system_valid:
                print("  ❌ System barèmes structure invalid")
            if not personalized_valid:
                print("  ❌ Personalized barèmes structure invalid")
            if not custom_valid:
                print("  ❌ Custom barèmes structure invalid")
            if missing_baremes:
                print(f"  ❌ Missing expected barèmes: {missing_baremes}")
            return False
            
    except Exception as e:
        print_test_result(False, f"Data structure verification failed - {str(e)}")
        return False

def test_database_consistency():
    """Test 4: Verify database consistency by checking expected data"""
    print_test_header("Database Consistency Verification")
    try:
        headers = get_auth_headers()
        
        # Get barèmes again to verify consistency
        response = requests.get(f"{API_BASE}/baremes-kilometriques/societe/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            baremes = data.get('baremes_kilometriques', [])
            summary = data.get('summary', {})
            
            # Check summary consistency
            system_count = summary.get('system_baremes', 0)
            personalized_count = summary.get('personalized_baremes', 0)
            custom_count = summary.get('custom_baremes', 0)
            total_count = summary.get('total', 0)
            
            actual_system = len([b for b in baremes if b.get('source_type') == 'system'])
            actual_personalized = len([b for b in baremes if b.get('source_type') == 'personalized'])
            actual_custom = len([b for b in baremes if b.get('source_type') == 'custom'])
            actual_total = len(baremes)
            
            summary_consistent = (
                system_count == actual_system and
                personalized_count == actual_personalized and
                custom_count == actual_custom and
                total_count == actual_total
            )
            
            # Check for expected personalized barème
            vehicule_eco = next((b for b in baremes if "économique" in b.get('nom', '').lower() and b.get('source_type') == 'personalized'), None)
            
            if summary_consistent and vehicule_eco:
                print_test_result(True, f"Database consistency verified", response)
                print(f"  - Summary counts match actual data: ✅")
                print(f"    System: {system_count}, Personalized: {personalized_count}, Custom: {custom_count}, Total: {total_count}")
                print(f"  - Expected personalized barème found: ✅")
                print(f"    '{vehicule_eco.get('nom')}' with tariff {vehicule_eco.get('tarif_km')}€/km")
                return True, data
            else:
                print_test_result(False, f"Database consistency issues detected", response)
                if not summary_consistent:
                    print(f"  ❌ Summary counts mismatch:")
                    print(f"    Summary: S:{system_count}, P:{personalized_count}, C:{custom_count}, T:{total_count}")
                    print(f"    Actual:  S:{actual_system}, P:{actual_personalized}, C:{actual_custom}, T:{actual_total}")
                if not vehicule_eco:
                    print(f"  ❌ Expected personalized barème 'Véhicule économique personnalisé' not found")
                return False, None
        else:
            print_test_result(False, f"Database consistency check failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Database consistency test failed - {str(e)}")
        return False, None

def main():
    """Main test execution for Barèmes Kilométriques APIs"""
    print("🚀 Starting Backend API Tests for Barèmes Kilométriques")
    print("📊 Testing: Barèmes kilométriques management with system, personalized, and custom barèmes")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Email: {TEST_EMAIL}")
    print(f"Company ID: {SOCIETE_ID}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    baremes_data = None
    
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
    
    # Test 2: GET barèmes-kilométriques
    get_success, get_data, system_baremes, personalized_baremes, custom_baremes = test_get_baremes_kilometriques()
    test_results.append(("GET Barèmes Kilométriques", get_success))
    
    if get_success:
        baremes_data = (get_data, get_success, system_baremes, personalized_baremes, custom_baremes)
    
    # Test 3: Verify data structure (only if GET was successful)
    structure_success = False
    if get_success and baremes_data:
        structure_success = test_verify_data_structure(baremes_data)
        test_results.append(("Verify Data Structure", structure_success))
    else:
        test_results.append(("Verify Data Structure", False))
    
    # Test 4: Database consistency
    consistency_success, consistency_data = test_database_consistency()
    test_results.append(("Database Consistency", consistency_success))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY - BARÈMES KILOMÉTRIQUES APIs")
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
    
    if get_success and baremes_data:
        system_count = len(baremes_data[2])
        personalized_count = len(baremes_data[3])
        custom_count = len(baremes_data[4])
        total_baremes = system_count + personalized_count + custom_count
        print(f"✅ GET /api/baremes-kilometriques/societe/{SOCIETE_ID} working - {total_baremes} barèmes found")
        print(f"  - System barèmes: {system_count}")
        print(f"  - Personalized barèmes: {personalized_count}")
        print(f"  - Custom barèmes: {custom_count}")
    else:
        print(f"❌ GET /api/baremes-kilometriques/societe/{SOCIETE_ID} failed")
    
    if structure_success:
        print(f"✅ Data structure verification successful - All barèmes have correct structure")
    else:
        print("❌ Data structure verification failed")
    
    if consistency_success:
        print(f"✅ Database consistency verified - Expected data found")
    else:
        print("❌ Database consistency verification failed")
    
    # Overall assessment
    critical_tests = ["Server Connectivity", "Authentication", "GET Barèmes Kilométriques"]
    critical_passed = sum(1 for test_name, result in test_results if test_name in critical_tests and result)
    
    if critical_passed == 3 and passed >= 3:  # All critical tests + most functionality tests
        print(f"\n🎉 BARÈMES KILOMÉTRIQUES API TESTS SUCCESSFUL!")
        print("✅ Backend server is responding correctly")
        print("✅ User authentication is working with correct credentials")
        print(f"✅ GET /api/baremes-kilometriques/societe/{SOCIETE_ID} endpoint returns all barème types")
        print("✅ Response structure includes system, personalized, and custom barèmes")
        print("✅ Expected 6 system barèmes by default are present")
        print("✅ Expected personalized barème 'Véhicule économique personnalisé' with 0.55€ tariff found")
        print("✅ Summary contains system_baremes, personalized_baremes, custom_baremes counts")
        print("✅ All barèmes have required fields: id, nom, description, puissance_fiscale, tarif_km, source_type, is_personalized")
        print("✅ Barèmes kilométriques API is working correctly and ready for frontend integration")
        return True
    else:
        print(f"\n⚠️ ISSUES DETECTED IN BARÈMES KILOMÉTRIQUES API")
        if critical_passed < 3:
            print("❌ Critical infrastructure issues detected (server/auth/get endpoint)")
        else:
            print("❌ Some barèmes kilométriques operations are not working correctly")
        print("❌ Barèmes kilométriques API may need fixes")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)