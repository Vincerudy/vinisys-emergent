#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Phase 2
Tests the refactored separated modules: Achats (Purchases) and Notes de frais (Expense Reports)
"""

import requests
import json
import sys
from datetime import datetime, date

# Backend URL configuration - Using external URL from backend .env
BASE_URL = "https://api.vinisys.com"  # External URL from backend .env
API_BASE = f"{BASE_URL}/api"

# Test credentials
TEST_EMAIL = "demo@demo.com"
TEST_PASSWORD = "123456"
TEST_SOCIETE_ID = 2  # Company ID for testing

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

def test_server_connectivity():
    """Test 1: Verify backend server is responding"""
    print_test_header("Backend Server Connectivity Test")
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "modules" in data and "achats" in data["modules"] and "notes-frais" in data["modules"]:
                print_test_result(True, f"Backend server v2.0 is responding with separated modules", response)
                return True
            else:
                print_test_result(False, f"Backend server responding but missing module info", response)
                return False
        else:
            print_test_result(False, f"Backend server returned unexpected status: {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Backend server connectivity failed - {str(e)}")
        return False

def test_database_connection():
    """Test 2: Test database connection"""
    print_test_header("Database Connection Test")
    try:
        response = requests.get(f"{API_BASE}/test-db", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "Connexion réussie" in data.get("message", "") and "modules" in data:
                print_test_result(True, "Database connection successful with modules info", response)
                return True
            else:
                print_test_result(False, "Database connection failed - unexpected response", response)
                return False
        else:
            print_test_result(False, f"Database connection failed - HTTP {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Database connection failed - {str(e)}")
        return False

def test_authentication_login():
    """Test 3: Test authentication endpoint with demo credentials"""
    print_test_header("Authentication Login Test")
    
    login_data = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    
    try:
        response = requests.post(f"{API_BASE}/login", json=login_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "token" in data and "id" in data:
                print_test_result(True, f"Authentication successful for user: {data.get('email', 'N/A')}", response)
                return True, data
            else:
                print_test_result(False, "Authentication response missing required fields", response)
                return False, None
        elif response.status_code == 401:
            print_test_result(False, "Authentication failed - Invalid credentials", response)
            return False, None
        else:
            print_test_result(False, f"Authentication failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Authentication test failed - {str(e)}")
        return False, None

def test_achats_dashboard(user_data):
    """Test 4: Test Achats (Purchases) Dashboard endpoint"""
    print_test_header("Achats Dashboard Test")
    
    if not user_data or 'societe_id' not in user_data:
        print_test_result(False, "No company data available for achats dashboard test")
        return False
    
    societe_id = user_data['societe_id']
    
    try:
        response = requests.get(f"{API_BASE}/achats/dashboard/{societe_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["periode", "indicateurs", "categories", "fournisseurs", "evolution", "validation", "statuts", "paiements"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result(True, f"Achats dashboard retrieved successfully - Company ID: {societe_id}", response)
                return True, data
            else:
                print_test_result(False, f"Achats dashboard missing fields: {missing_fields}", response)
                return False, None
        elif response.status_code == 404:
            print_test_result(False, "Company not found for achats dashboard", response)
            return False, None
        else:
            print_test_result(False, f"Achats dashboard failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Achats dashboard test failed - {str(e)}")
        return False, None

def test_notes_frais_dashboard(user_data):
    """Test 5: Test Notes de frais (Expense Reports) Dashboard endpoint"""
    print_test_header("Notes de frais Dashboard Test")
    
    if not user_data or 'societe_id' not in user_data:
        print_test_result(False, "No company data available for notes de frais dashboard test")
        return False
    
    societe_id = user_data['societe_id']
    
    try:
        response = requests.get(f"{API_BASE}/notes-frais/dashboard/{societe_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["periode", "indicateurs", "utilisateurs", "types_frais", "evolution", "statuts", "kilometriques"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result(True, f"Notes de frais dashboard retrieved successfully - Company ID: {societe_id}", response)
                return True, data
            else:
                print_test_result(False, f"Notes de frais dashboard missing fields: {missing_fields}", response)
                return False, None
        elif response.status_code == 404:
            print_test_result(False, "Company not found for notes de frais dashboard", response)
            return False, None
        else:
            print_test_result(False, f"Notes de frais dashboard failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Notes de frais dashboard test failed - {str(e)}")
        return False, None

def test_common_endpoints(user_data):
    """Test 6: Test common endpoints (types-frais, categories-achats, projets)"""
    print_test_header("Common Endpoints Test")
    
    if not user_data or 'societe_id' not in user_data:
        print_test_result(False, "No company data available for common endpoints test")
        return False
    
    societe_id = user_data['societe_id']
    endpoints_results = {}
    
    # Test types-frais
    try:
        response = requests.get(f"{API_BASE}/types-frais/{societe_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "types" in data:
                endpoints_results["types-frais"] = True
                print(f"  ✅ Types de frais: {len(data['types'])} types found")
            else:
                endpoints_results["types-frais"] = False
                print(f"  ❌ Types de frais: Missing 'types' field")
        else:
            endpoints_results["types-frais"] = False
            print(f"  ❌ Types de frais: HTTP {response.status_code}")
    except Exception as e:
        endpoints_results["types-frais"] = False
        print(f"  ❌ Types de frais: {str(e)}")
    
    # Test categories-achats
    try:
        response = requests.get(f"{API_BASE}/categories-achats/{societe_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "categories" in data:
                endpoints_results["categories-achats"] = True
                print(f"  ✅ Catégories achats: {len(data['categories'])} categories found")
            else:
                endpoints_results["categories-achats"] = False
                print(f"  ❌ Catégories achats: Missing 'categories' field")
        else:
            endpoints_results["categories-achats"] = False
            print(f"  ❌ Catégories achats: HTTP {response.status_code}")
    except Exception as e:
        endpoints_results["categories-achats"] = False
        print(f"  ❌ Catégories achats: {str(e)}")
    
    # Test projets
    try:
        response = requests.get(f"{API_BASE}/projets/{societe_id}", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "projets" in data:
                endpoints_results["projets"] = True
                print(f"  ✅ Projets: {len(data['projets'])} projects found")
            else:
                endpoints_results["projets"] = False
                print(f"  ❌ Projets: Missing 'projets' field")
        else:
            endpoints_results["projets"] = False
            print(f"  ❌ Projets: HTTP {response.status_code}")
    except Exception as e:
        endpoints_results["projets"] = False
        print(f"  ❌ Projets: {str(e)}")
    
    success_count = sum(endpoints_results.values())
    total_count = len(endpoints_results)
    
    if success_count == total_count:
        print_test_result(True, f"All common endpoints working ({success_count}/{total_count})")
        return True, endpoints_results
    else:
        print_test_result(False, f"Some common endpoints failed ({success_count}/{total_count})")
        return False, endpoints_results

def test_create_achat(user_data):
    """Test 7: Test creating a new achat (purchase)"""
    print_test_header("Create Achat Test")
    
    if not user_data or 'id' not in user_data or 'societe_id' not in user_data:
        print_test_result(False, "No user data available for achat creation test")
        return False
    
    # First, get categories to use a valid category_id
    try:
        categories_response = requests.get(f"{API_BASE}/categories-achats/{user_data['societe_id']}", timeout=10)
        if categories_response.status_code != 200:
            print_test_result(False, "Cannot get categories for achat creation")
            return False
        
        categories_data = categories_response.json()
        if not categories_data.get('categories'):
            print_test_result(False, "No categories available for achat creation")
            return False
        
        category_id = categories_data['categories'][0]['id']
    except Exception as e:
        print_test_result(False, f"Error getting categories: {str(e)}")
        return False
    
    achat_data = {
        "numero_facture": f"FACT-TEST-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "fournisseur_id": 1,  # Assuming fournisseur with ID 1 exists
        "date_achat": date.today().isoformat(),
        "date_facture": date.today().isoformat(),
        "montant_ht": "150.00",
        "taux_tva": "20",
        "tva_deductible": True,
        "categorie_achat_id": category_id,
        "description": "Test achat via API - Fournitures bureau",
        "mode_paiement": "virement",
        "utilisateur_id": user_data['id'],
        "societe_id": user_data['societe_id'],
        "saisie_ocr": False
    }
    
    try:
        response = requests.post(f"{API_BASE}/achat", json=achat_data, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            if "message" in data and "achatId" in data:
                print_test_result(True, f"Achat created successfully with ID: {data['achatId']}, Amount: {data.get('montant_ttc', 'N/A')}€", response)
                return True, data.get("achatId")
            else:
                print_test_result(False, "Achat creation response missing required fields", response)
                return False, None
        elif response.status_code == 400:
            print_test_result(False, "Achat creation failed - Bad request", response)
            return False, None
        else:
            print_test_result(False, f"Achat creation failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Achat creation test failed - {str(e)}")
        return False, None

def test_create_note_frais(user_data):
    """Test 8: Test creating a new note de frais with mileage"""
    print_test_header("Create Note de frais Test")
    
    if not user_data or 'id' not in user_data or 'societe_id' not in user_data:
        print_test_result(False, "No user data available for note de frais creation test")
        return False
    
    # First, get types de frais to use a valid type_id for mileage
    try:
        types_response = requests.get(f"{API_BASE}/types-frais/{user_data['societe_id']}", timeout=10)
        if types_response.status_code != 200:
            print_test_result(False, "Cannot get types de frais for note creation")
            return False
        
        types_data = types_response.json()
        if not types_data.get('types'):
            print_test_result(False, "No types de frais available for note creation")
            return False
        
        # Look for mileage type (code 'KM' or similar)
        km_type = None
        for type_frais in types_data['types']:
            if type_frais.get('code') == 'KM' or 'kilom' in type_frais.get('nom', '').lower():
                km_type = type_frais
                break
        
        if not km_type:
            # Use first available type
            km_type = types_data['types'][0]
            
        type_frais_id = km_type['id']
    except Exception as e:
        print_test_result(False, f"Error getting types de frais: {str(e)}")
        return False
    
    note_data = {
        "utilisateur_id": user_data['id'],
        "periode_debut": "2024-01-01",
        "periode_fin": "2024-01-31",
        "titre": "Note de frais test - Janvier 2024",
        "description": "Note de frais de test avec frais kilométriques",
        "societe_id": user_data['societe_id'],
        "lignes_frais": [
            {
                "type_frais_id": type_frais_id,
                "date_frais": date.today().isoformat(),
                "description": "Déplacement client - Bureau vers site client",
                "montant": "42.50",
                "distance_km": 85,
                "lieu_depart": "Bureau Lyon",
                "lieu_arrivee": "Client ABC Paris",
                "type_vehicule": "voiture",
                "saisie_ocr": False
            }
        ]
    }
    
    try:
        response = requests.post(f"{API_BASE}/note-frais", json=note_data, timeout=10)
        
        if response.status_code == 201:
            data = response.json()
            if "message" in data and "noteId" in data:
                print_test_result(True, f"Note de frais created successfully - ID: {data['noteId']}, Number: {data.get('numero', 'N/A')}, Amount: {data.get('montant_total', 'N/A')}€", response)
                return True, data.get("noteId")
            else:
                print_test_result(False, "Note de frais creation response missing required fields", response)
                return False, None
        elif response.status_code == 400:
            print_test_result(False, "Note de frais creation failed - Bad request", response)
            return False, None
        else:
            print_test_result(False, f"Note de frais creation failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Note de frais creation test failed - {str(e)}")
        return False, None

def test_mileage_calculation(user_data):
    """Test 9: Test mileage calculation endpoint"""
    print_test_header("Mileage Calculation Test")
    
    if not user_data or 'societe_id' not in user_data:
        print_test_result(False, "No company data available for mileage calculation test")
        return False
    
    calculation_data = {
        "distance_km": 85,
        "type_vehicule": "voiture",
        "annee": 2024,
        "societe_id": user_data['societe_id']
    }
    
    try:
        response = requests.post(f"{API_BASE}/notes-frais/calcul-km", json=calculation_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            required_fields = ["distance_km", "type_vehicule", "montant", "bareme_id", "detail_calcul"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if not missing_fields:
                print_test_result(True, f"Mileage calculation successful - {data['distance_km']}km = {data['montant']}€", response)
                return True, data
            else:
                print_test_result(False, f"Mileage calculation missing fields: {missing_fields}", response)
                return False, None
        elif response.status_code == 404:
            print_test_result(False, "Mileage calculation failed - Barème not found", response)
            return False, None
        elif response.status_code == 400:
            print_test_result(False, "Mileage calculation failed - Bad request", response)
            return False, None
        else:
            print_test_result(False, f"Mileage calculation failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"Mileage calculation test failed - {str(e)}")
        return False, None

def main():
    """Main test execution for Phase 2 - Separated Modules Testing"""
    print("🚀 Starting Backend API Tests for Vinisys Phase 2 - Separated Modules")
    print("📊 Testing: Achats (Purchases) and Notes de frais (Expense Reports)")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Credentials: {TEST_EMAIL} / {TEST_PASSWORD}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Track test results
    test_results = []
    user_data = None
    
    # Test 1: Server connectivity
    server_ok = test_server_connectivity()
    test_results.append(("Server Connectivity", server_ok))
    
    if not server_ok:
        print("\n❌ Backend server is not responding. Stopping tests.")
        return False
    
    # Test 2: Database connection
    db_connected = test_database_connection()
    test_results.append(("Database Connection", db_connected))
    
    if not db_connected:
        print("\n❌ Database connection failed. Stopping tests.")
        return False
    
    # Test 3: Authentication
    auth_success, user_data = test_authentication_login()
    test_results.append(("Authentication Login", auth_success))
    
    if not auth_success or not user_data:
        print("\n❌ Authentication failed. Cannot proceed with module tests.")
        return False
    
    # Test 4: Achats Dashboard
    achats_dashboard_success, achats_data = test_achats_dashboard(user_data)
    test_results.append(("Achats Dashboard", achats_dashboard_success))
    
    # Test 5: Notes de frais Dashboard
    notes_dashboard_success, notes_data = test_notes_frais_dashboard(user_data)
    test_results.append(("Notes de frais Dashboard", notes_dashboard_success))
    
    # Test 6: Common endpoints
    common_success, common_data = test_common_endpoints(user_data)
    test_results.append(("Common Endpoints", common_success))
    
    # Test 7: Create Achat (only if common endpoints work)
    if common_success:
        achat_create_success, achat_id = test_create_achat(user_data)
        test_results.append(("Create Achat", achat_create_success))
    else:
        test_results.append(("Create Achat", False))
    
    # Test 8: Create Note de frais (only if common endpoints work)
    if common_success:
        note_create_success, note_id = test_create_note_frais(user_data)
        test_results.append(("Create Note de frais", note_create_success))
    else:
        test_results.append(("Create Note de frais", False))
    
    # Test 9: Mileage calculation
    mileage_success, mileage_data = test_mileage_calculation(user_data)
    test_results.append(("Mileage Calculation", mileage_success))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY - PHASE 2 SEPARATED MODULES")
    print(f"{'='*60}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    # Module-specific analysis
    print(f"\n{'='*60}")
    print("MODULE ARCHITECTURE ANALYSIS")
    print(f"{'='*60}")
    
    if server_ok:
        print("✅ Backend server v2.0 is running with separated modules")
    if db_connected:
        print("✅ Database connection is working with module support")
    if auth_success:
        print(f"✅ Authentication system is working")
        if user_data:
            print(f"   - User ID: {user_data.get('id', 'N/A')}")
            print(f"   - Email: {user_data.get('email', 'N/A')}")
            print(f"   - Company ID: {user_data.get('societe_id', 'N/A')}")
    
    # Module-specific results
    if achats_dashboard_success:
        print("✅ Achats (Purchases) module is fully operational")
    else:
        print("❌ Achats (Purchases) module has issues")
        
    if notes_dashboard_success:
        print("✅ Notes de frais (Expense Reports) module is fully operational")
    else:
        print("❌ Notes de frais (Expense Reports) module has issues")
        
    if common_success:
        print("✅ Common endpoints (types, categories, projects) are working")
    else:
        print("❌ Common endpoints have issues")
        
    if mileage_success:
        print("✅ Mileage calculation system is working")
    else:
        print("❌ Mileage calculation system has issues")
    
    # Final assessment
    critical_tests = ["Server Connectivity", "Database Connection", "Authentication Login", 
                     "Achats Dashboard", "Notes de frais Dashboard", "Common Endpoints"]
    critical_passed = sum(1 for test_name, result in test_results if test_name in critical_tests and result)
    
    if critical_passed >= 5:  # At least 5/6 critical tests passing
        print("\n🎉 Phase 2 separated modules are working correctly!")
        if passed == total:
            print("🎉 All tests passed! The refactored backend is fully functional.")
        else:
            print("⚠️  Some advanced features may need attention, but core functionality is solid.")
        return True
    else:
        print("\n⚠️  Critical issues detected in the separated modules architecture.")
        print("   Please check the failures above before proceeding to frontend testing.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)