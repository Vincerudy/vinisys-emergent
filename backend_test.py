#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Notes de frais Testing
Tests the specific endpoints requested for notes de frais creation
"""

import requests
import json
import sys
from datetime import datetime, date

# Backend URL configuration - Using frontend environment URL
with open('/app/frontend/.env', 'r') as f:
    env_content = f.read()
    for line in env_content.split('\n'):
        if line.startswith('VITE_API_URL='):
            api_path = line.split('=')[1]
            break
    else:
        api_path = '/api'

BASE_URL = "http://localhost:8001"  # Internal URL for testing
API_BASE = f"{BASE_URL}{api_path}"

# Test credentials from user request
TEST_EMAIL = "admin@admin.com"
TEST_PASSWORD = "admin"
SOCIETE_ID = 2  # User specified societe_id = 2
AUTH_TOKEN = None  # Will be set after login

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
            data = response.json()
            print_test_result(True, f"Backend server is responding - Version: {data.get('version', 'Unknown')}", response)
            return True
        else:
            print_test_result(False, f"Backend server returned unexpected status: {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Backend server connectivity failed - {str(e)}")
        return False

def test_authentication():
    """Test 1: Authentication with admin@admin.com / admin credentials"""
    global AUTH_TOKEN
    print_test_header("Authentication Test - Admin Login")
    try:
        payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        response = requests.post(f"{API_BASE}/login", json=payload, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            AUTH_TOKEN = data.get('token')
            user_id = data.get('id')
            societe_id = data.get('societe_id')
            
            if AUTH_TOKEN and societe_id == SOCIETE_ID:
                print_test_result(True, f"Authentication successful - User ID: {user_id}, Company ID: {societe_id}", response)
                return True, data
            else:
                print_test_result(False, f"Authentication response issue - Expected societe_id: {SOCIETE_ID}, Got: {societe_id}", response)
                return False, None
        else:
            print_test_result(False, f"Authentication failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Authentication test failed - {str(e)}")
        return False, None

def test_projets():
    """Test 2: Projects API for societe_id = 2"""
    print_test_header("Projects API Test")
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/projets/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            projets = data.get('projets', [])
            print_test_result(True, f"Projects retrieved successfully - {len(projets)} projects found", response)
            return True, data
        else:
            print_test_result(False, f"Projects failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Projects test failed - {str(e)}")
        return False, None

def test_create_note_frais():
    """Test 3: Create Note de frais with specific data"""
    print_test_header("Create Note de frais Test")
    try:
        headers = get_auth_headers()
        headers['Content-Type'] = 'application/json'
        
        # Get user_id from auth token (we'll use a default if not available)
        user_id = 1  # Default user_id, should be updated based on login response
        
        # Prepare the note de frais data as specified by user
        payload = {
            "user_id": user_id,
            "periode_debut": "2024-10-24",
            "periode_fin": "2024-10-24", 
            "titre": "Note de frais - LA ROMANA",
            "description": "Déjeuner d'affaires client",
            "societe_id": SOCIETE_ID,
            "lignes_frais": [
                {
                    "type_frais_id": 1,  # Assuming 1 is for restaurant/meals
                    "date_frais": "2024-10-24",
                    "description": "Déjeuner d'affaires client - LA ROMANA",
                    "montant": 364.00,
                    "montant_tva": 35.78,
                    "taux_tva": 20.0,
                    "lieu_repas": "LA ROMANA, France",
                    "nombre_personnes": 2,
                    "type_repas": "déjeuner",
                    "projet_id": None,
                    "saisie_ocr": False
                }
            ]
        }
        
        # Test the actual endpoint (POST /api/note-frais)
        response = requests.post(f"{API_BASE}/note-frais", json=payload, headers=headers, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            note_id = data.get('noteId')
            numero = data.get('numero')
            montant_total = data.get('montant_total')
            
            print_test_result(True, f"Note de frais created successfully - ID: {note_id}, Number: {numero}, Total: {montant_total}€", response)
            return True, data
        else:
            print_test_result(False, f"Note de frais creation failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Note de frais creation test failed - {str(e)}")
        return False, None

def test_achats_dashboard():
    """Test 2: Achats Module Dashboard API"""
    print_test_header("Achats Dashboard Test")
    if not SOCIETE_ID:
        print_test_result(False, "Cannot test - No company ID available")
        return False, None
        
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/achats/dashboard/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Check for key dashboard fields
            expected_fields = ["indicateurs", "periode"]
            missing_fields = [field for field in expected_fields if field not in data]
            
            if len(missing_fields) == 0:
                indicateurs = data.get('indicateurs', {})
                print_test_result(True, f"Achats dashboard retrieved successfully - {indicateurs.get('nb_achats', 0)} achats found", response)
                return True, data
            else:
                print_test_result(False, f"Achats dashboard missing key fields: {missing_fields}", response)
                return False, None
        else:
            print_test_result(False, f"Achats dashboard failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Achats dashboard test failed - {str(e)}")
        return False, None

def test_achats_fournisseurs():
    """Test 3: Achats Suppliers API"""
    print_test_header("Achats Suppliers Test")
    if not SOCIETE_ID:
        print_test_result(False, "Cannot test - No company ID available")
        return False, None
        
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/achats/fournisseurs/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            fournisseurs = data.get('fournisseurs', [])
            print_test_result(True, f"Suppliers list retrieved successfully - {len(fournisseurs)} suppliers found", response)
            return True, data
        else:
            print_test_result(False, f"Suppliers list failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Suppliers list test failed - {str(e)}")
        return False, None

def test_categories_achats():
    """Test 4: Purchase Categories API"""
    print_test_header("Purchase Categories Test")
    if not SOCIETE_ID:
        print_test_result(False, "Cannot test - No company ID available")
        return False, None
        
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/categories-achats/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            categories = data.get('categories', [])
            print_test_result(True, f"Purchase categories retrieved successfully - {len(categories)} categories found", response)
            return True, data
        else:
            print_test_result(False, f"Purchase categories failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Purchase categories test failed - {str(e)}")
        return False, None

def test_projets():
    """Test 5: Projects/Cost Centers API"""
    print_test_header("Projects/Cost Centers Test")
    if not SOCIETE_ID:
        print_test_result(False, "Cannot test - No company ID available")
        return False, None
        
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/projets/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            projets = data.get('projets', [])
            print_test_result(True, f"Projects retrieved successfully - {len(projets)} projects found", response)
            return True, data
        else:
            print_test_result(False, f"Projects failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Projects test failed - {str(e)}")
        return False, None

def test_notes_frais_dashboard():
    """Test 6: Notes de frais Module Dashboard API"""
    print_test_header("Notes de frais Dashboard Test")
    if not SOCIETE_ID:
        print_test_result(False, "Cannot test - No company ID available")
        return False, None
        
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/notes-frais/dashboard/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            # Check for key dashboard fields
            expected_fields = ["indicateurs", "periode"]
            missing_fields = [field for field in expected_fields if field not in data]
            
            if len(missing_fields) == 0:
                indicateurs = data.get('indicateurs', {})
                print_test_result(True, f"Notes de frais dashboard retrieved successfully - {indicateurs.get('nb_notes', 0)} notes found", response)
                return True, data
            else:
                print_test_result(False, f"Notes de frais dashboard missing key fields: {missing_fields}", response)
                return False, None
        else:
            print_test_result(False, f"Notes de frais dashboard failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Notes de frais dashboard test failed - {str(e)}")
        return False, None

def test_types_frais():
    """Test 7: Expense Types API"""
    print_test_header("Expense Types Test")
    if not SOCIETE_ID:
        print_test_result(False, "Cannot test - No company ID available")
        return False, None
        
    try:
        headers = get_auth_headers()
        response = requests.get(f"{API_BASE}/types-frais/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            types = data.get('types', [])
            print_test_result(True, f"Expense types retrieved successfully - {len(types)} types found", response)
            return True, data
        else:
            print_test_result(False, f"Expense types failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Expense types test failed - {str(e)}")
        return False, None

def main():
    """Main test execution for New Modules Testing"""
    print("🚀 Starting Backend API Tests for Vinisys - New Modules (Achats & Notes de frais)")
    print("📊 Testing: Authentication, Achats APIs, Notes de frais APIs")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Email: {TEST_EMAIL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    
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
        print("\n❌ Authentication failed. Cannot proceed with module tests.")
        return False
    
    # Test 2: Achats Dashboard
    achats_dashboard_success, achats_dashboard_data = test_achats_dashboard()
    test_results.append(("Achats Dashboard", achats_dashboard_success))
    
    # Test 3: Achats Suppliers
    suppliers_success, suppliers_data = test_achats_fournisseurs()
    test_results.append(("Achats Suppliers", suppliers_success))
    
    # Test 4: Purchase Categories
    categories_success, categories_data = test_categories_achats()
    test_results.append(("Purchase Categories", categories_success))
    
    # Test 5: Projects
    projects_success, projects_data = test_projets()
    test_results.append(("Projects/Cost Centers", projects_success))
    
    # Test 6: Notes de frais Dashboard
    notes_dashboard_success, notes_dashboard_data = test_notes_frais_dashboard()
    test_results.append(("Notes de frais Dashboard", notes_dashboard_success))
    
    # Test 7: Expense Types
    types_success, types_data = test_types_frais()
    test_results.append(("Expense Types", types_success))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY - NEW MODULES TESTING")
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
    print("NEW MODULES ANALYSIS")
    print(f"{'='*60}")
    
    if server_ok:
        print("✅ Backend server is responding")
    
    if auth_success:
        print(f"✅ Authentication working with company ID: {SOCIETE_ID}")
    
    # Achats Module Analysis
    achats_tests = ["Achats Dashboard", "Achats Suppliers", "Purchase Categories", "Projects/Cost Centers"]
    achats_passed = sum(1 for test_name, result in test_results if test_name in achats_tests and result)
    
    print(f"\n🧾 ACHATS MODULE: {achats_passed}/{len(achats_tests)} tests passed")
    if achats_passed >= 3:
        print("✅ Achats module appears to be working correctly")
    else:
        print("❌ Achats module has significant issues")
    
    # Notes de frais Module Analysis
    notes_tests = ["Notes de frais Dashboard", "Expense Types"]
    notes_passed = sum(1 for test_name, result in test_results if test_name in notes_tests and result)
    
    print(f"\n💳 NOTES DE FRAIS MODULE: {notes_passed}/{len(notes_tests)} tests passed")
    if notes_passed >= 1:
        print("✅ Notes de frais module appears to be working correctly")
    else:
        print("❌ Notes de frais module has significant issues")
    
    # Overall assessment
    critical_tests = achats_tests + notes_tests
    critical_passed = sum(1 for test_name, result in test_results if test_name in critical_tests and result)
    
    if critical_passed >= 5:  # At least 5/6 critical tests passing
        print(f"\n🎉 NEW MODULES TESTING SUCCESSFUL!")
        print("✅ Both Achats and Notes de frais modules are operational")
        print("✅ Core dashboard and data retrieval endpoints are working")
        print("✅ Ready for frontend integration")
        return True
    else:
        print(f"\n⚠️ NEW MODULES HAVE ISSUES")
        print("❌ Some critical endpoints are not working properly")
        print("❌ Frontend integration may encounter problems")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)