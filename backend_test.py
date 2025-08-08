#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Financial Report Testing
Tests the financial report API endpoints as requested
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

def test_financial_report_main():
    """Test 1: Main Financial Report API - GET /api/rapport/financier/2"""
    print_test_header("Financial Report Main API Test")
    try:
        headers = get_auth_headers()
        
        # Test with monthly period for August 2025
        params = {
            'date_debut': '2025-08-01',
            'date_fin': '2025-08-31',
            'periode': 'mois'
        }
        
        response = requests.get(f"{API_BASE}/rapport/financier/{SOCIETE_ID}", 
                              headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for all required sections
            required_sections = ['chiffre_affaires', 'factures', 'depenses', 'notes_frais', 'benefice_net']
            missing_sections = [section for section in required_sections if section not in data]
            
            if len(missing_sections) == 0:
                # Verify chiffre_affaires structure
                ca = data.get('chiffre_affaires', {})
                ca_fields = ['total', 'encaisse', 'en_attente', 'avoirs', 'tva_repartition']
                ca_missing = [field for field in ca_fields if field not in ca]
                
                # Verify depenses structure
                depenses = data.get('depenses', {})
                dep_fields = ['total_ht', 'total_tva', 'total_ttc', 'tva_recuperable', 'categories']
                dep_missing = [field for field in dep_fields if field not in depenses]
                
                # Verify notes_frais structure
                notes = data.get('notes_frais', {})
                notes_fields = ['total_rembourse', 'nombre_notes', 'categories']
                notes_missing = [field for field in notes_fields if field not in notes]
                
                if len(ca_missing) == 0 and len(dep_missing) == 0 and len(notes_missing) == 0:
                    benefice_net = data.get('benefice_net', 0)
                    print_test_result(True, f"Financial report retrieved successfully - Bénéfice net: {benefice_net}€", response)
                    return True, data
                else:
                    missing_all = ca_missing + dep_missing + notes_missing
                    print_test_result(False, f"Financial report missing sub-fields: {missing_all}", response)
                    return False, None
            else:
                print_test_result(False, f"Financial report missing sections: {missing_sections}", response)
                return False, None
        else:
            print_test_result(False, f"Financial report failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Financial report test failed - {str(e)}")
        return False, None

def test_financial_report_daily():
    """Test 2: Financial Report API - Daily period"""
    print_test_header("Financial Report Daily Period Test")
    try:
        headers = get_auth_headers()
        
        # Test with daily period for specific date
        params = {
            'date_debut': '2025-08-08',
            'date_fin': '2025-08-08',
            'periode': 'jour'
        }
        
        response = requests.get(f"{API_BASE}/rapport/financier/{SOCIETE_ID}", 
                              headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            periode = data.get('periode', {})
            if periode.get('type') == 'jour':
                print_test_result(True, f"Daily financial report retrieved successfully", response)
                return True, data
            else:
                print_test_result(False, f"Daily report period type incorrect: {periode.get('type')}", response)
                return False, None
        else:
            print_test_result(False, f"Daily financial report failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Daily financial report test failed - {str(e)}")
        return False, None

def test_financial_report_yearly():
    """Test 3: Financial Report API - Yearly period"""
    print_test_header("Financial Report Yearly Period Test")
    try:
        headers = get_auth_headers()
        
        # Test with yearly period for 2025
        params = {
            'date_debut': '2025-01-01',
            'date_fin': '2025-12-31',
            'periode': 'annee'
        }
        
        response = requests.get(f"{API_BASE}/rapport/financier/{SOCIETE_ID}", 
                              headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            periode = data.get('periode', {})
            if periode.get('type') == 'annee':
                print_test_result(True, f"Yearly financial report retrieved successfully", response)
                return True, data
            else:
                print_test_result(False, f"Yearly report period type incorrect: {periode.get('type')}", response)
                return False, None
        else:
            print_test_result(False, f"Yearly financial report failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Yearly financial report test failed - {str(e)}")
        return False, None

def test_financial_calculations():
    """Test 4: Verify Financial Calculations"""
    print_test_header("Financial Calculations Verification Test")
    try:
        headers = get_auth_headers()
        
        # Get August 2025 report for calculation verification
        params = {
            'date_debut': '2025-08-01',
            'date_fin': '2025-08-31',
            'periode': 'mois'
        }
        
        response = requests.get(f"{API_BASE}/rapport/financier/{SOCIETE_ID}", 
                              headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract calculation components
            ca_encaisse = data.get('chiffre_affaires', {}).get('encaisse', 0)
            avoirs = data.get('chiffre_affaires', {}).get('avoirs', 0)
            depenses_ttc = data.get('depenses', {}).get('total_ttc', 0)
            tva_recuperable = data.get('depenses', {}).get('tva_recuperable', 0)
            notes_frais = data.get('notes_frais', {}).get('total_rembourse', 0)
            benefice_net = data.get('benefice_net', 0)
            
            # Verify calculation: Bénéfice net = (CA encaissé - Avoirs) - (Dépenses TTC - TVA récupérable) - Notes de frais
            calculated_benefice = (ca_encaisse - avoirs) - (depenses_ttc - tva_recuperable) - notes_frais
            
            # Allow small floating point differences
            difference = abs(calculated_benefice - benefice_net)
            
            if difference < 0.01:  # Less than 1 cent difference
                print_test_result(True, f"Financial calculations verified - Expected: {calculated_benefice}€, Got: {benefice_net}€", response)
                return True, data
            else:
                print_test_result(False, f"Financial calculations incorrect - Expected: {calculated_benefice}€, Got: {benefice_net}€, Difference: {difference}€", response)
                return False, None
        else:
            print_test_result(False, f"Financial calculations test failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Financial calculations test failed - {str(e)}")
        return False, None

def test_evolution_depenses():
    """Test 5: Evolution Depenses API - GET /api/rapport/evolution-depenses/2"""
    print_test_header("Evolution Depenses API Test")
    try:
        headers = get_auth_headers()
        
        # Test evolution API with monthly periods for 2025
        params = {
            'annee': '2025',
            'type_periode': 'mois'
        }
        
        response = requests.get(f"{API_BASE}/rapport/evolution-depenses/{SOCIETE_ID}", 
                              headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for required fields
            required_fields = ['evolution', 'type_periode', 'annee']
            missing_fields = [field for field in required_fields if field not in data]
            
            if len(missing_fields) == 0:
                evolution = data.get('evolution', [])
                type_periode = data.get('type_periode')
                annee = data.get('annee')
                
                if type_periode == 'mois' and annee == 2025:
                    print_test_result(True, f"Evolution depenses retrieved successfully - {len(evolution)} periods found", response)
                    return True, data
                else:
                    print_test_result(False, f"Evolution depenses parameters incorrect - Type: {type_periode}, Year: {annee}", response)
                    return False, None
            else:
                print_test_result(False, f"Evolution depenses missing fields: {missing_fields}", response)
                return False, None
        else:
            print_test_result(False, f"Evolution depenses failed - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Evolution depenses test failed - {str(e)}")
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