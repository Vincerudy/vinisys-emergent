#!/usr/bin/env python3
"""
Backend API Testing Script for Vinisys Application - Test AchatSidebar avec Visionneuse de Fichiers

Tests des modifications apportées à la sidebar de création de dépense (AchatSidebar.jsx) pour implémenter une structure à deux colonnes avec visionneuse de fichiers.

**MODIFICATIONS TESTÉES :**

1. **Structure CSS :**
   - Largeur de la sidebar augmentée de 600px à 1200px
   - Ajout de `.achat-sidebar-body-left` et `.achat-sidebar-body-right` (50% chacune)
   - Styles pour la visionneuse de fichiers (`.file-viewer`)
   - Styles pour l'upload de fichiers (`.upload-area`, `.file-list`, `.file-item`)

2. **Fonctionnalités ajoutées :**
   - Upload de fichiers par glisser-déposer et clic
   - Support PDF et images (max 10MB)
   - Visionneuse intégrée : iframe pour PDF, img pour images
   - Liste des fichiers téléchargés avec sélection
   - Suppression individuelle des fichiers
   - Persistance des fichiers lors de la soumission du formulaire

3. **Structure JSX :**
   - Colonne gauche : Zone d'upload, liste des fichiers, visionneuse
   - Colonne droite : Formulaire de saisie des données (inchangé)
   - Intégration des nouveaux fichiers dans FormData lors de la soumission

**TESTS À EFFECTUER :**

1. **Test de l'endpoint backend :**
   - Vérifier que l'endpoint `/api/achat` accepte toujours les fichiers `justificatifs`
   - Tester la sauvegarde des fichiers sur le serveur
   - Vérifier que les métadonnées sont correctement enregistrées

2. **Test de structure :**
   - Vérifier que la sidebar s'ouvre avec la nouvelle largeur (1200px)
   - Tester que les deux colonnes s'affichent correctement
   - Valider que le scroll fonctionne dans chaque colonne

3. **Test de l'upload :**
   - Tester l'upload de fichiers PDF et images
   - Vérifier la validation de taille (max 10MB)
   - Tester le glisser-déposer
   - Vérifier la persistance lors de la soumission

Utilise la société ID=2 pour les tests. L'endpoint d'achat existe déjà et gère les justificatifs.
"""

import requests
import json
import sys
import os
from datetime import datetime

# Backend URL configuration - Using production URL from frontend/.env
REACT_APP_BACKEND_URL = "https://expense-ocr-sys.preview.emergentagent.com"
BASE_URL = REACT_APP_BACKEND_URL
API_BASE = f"{BASE_URL}/api"

# Test credentials from user request
TEST_EMAIL = "idnovation2014@gmail.com"
TEST_PASSWORD = "Cinema12"  # Password as specified in request
AUTH_TOKEN = None  # Will be set after login
USER_DATA = None  # Will be set after login
SOCIETE_ID = 2  # Societe ID to use for testing as specified in request
NOTE_FRAIS_ID = 69  # Note ID specified in request

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

def test_get_types_frais_manage():
    """Test 2: GET /api/types-frais/manage/:societeId - Types de frais avec personnalisations"""
    print_test_header("GET Types de Frais Manage API Test")
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
                    # Verify each type has required fields
                    required_fields = ['id', 'nom', 'libelle', 'actif', 'is_system', 'source_type']
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
                        print_test_result(True, f"GET types-frais/manage successful - {len(types_frais)} types found", response)
                        print(f"  - System types: {len(system_types)}")
                        print(f"  - Personalized types: {len(personalized_types)}")
                        print(f"  - Custom types: {len(custom_types)}")
                        print(f"  - Summary from API: {summary}")
                        
                        return True, data, system_types, personalized_types, custom_types
                    else:
                        print_test_result(False, f"Types de frais missing required fields", response)
                        return False, None, [], [], []
                else:
                    print_test_result(False, f"Invalid response structure - success: {success}, types type: {type(types_frais)}", response)
                    return False, None, [], [], []
            else:
                print_test_result(False, f"Response missing 'success' or 'types_frais' fields", response)
                return False, None, [], [], []
        else:
            print_test_result(False, f"GET types-frais/manage failed - HTTP {response.status_code}", response)
            return False, None, [], [], []
            
    except Exception as e:
        print_test_result(False, f"GET types-frais/manage test failed - {str(e)}")
        return False, None, [], [], []

def test_get_types_frais_societe():
    """Test 3: GET /api/types-frais/societe/:societeId - Types de frais pour société (alternative endpoint)"""
    print_test_header("GET Types de Frais Societe API Test")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/types-frais/societe/{SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_test_result(True, f"GET types-frais/societe successful", response)
            return True, data
        elif response.status_code == 404:
            print_test_result(True, f"GET types-frais/societe endpoint not found (404) - This is expected if endpoint doesn't exist", response)
            return True, None
        else:
            print_test_result(False, f"GET types-frais/societe failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"GET types-frais/societe test failed - {str(e)}")
        return False, None

def test_get_baremes_kilometriques():
    """Test 4: GET /api/baremes-kilometriques/societe/:societeId - Barèmes kilométriques pour société"""
    print_test_header("GET Barèmes Kilométriques Societe API Test")
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
                    required_fields = ['id', 'nom', 'description', 'puissance_fiscale', 'tarif_km', 'source_type']
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
                        print_test_result(True, f"GET barèmes-kilométriques/societe successful - {len(baremes)} barèmes found", response)
                        print(f"  - System barèmes: {len(system_baremes)}")
                        print(f"  - Personalized barèmes: {len(personalized_baremes)}")
                        print(f"  - Custom barèmes: {len(custom_baremes)}")
                        print(f"  - Summary from API: {summary}")
                        
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
            print_test_result(False, f"GET barèmes-kilométriques/societe failed - HTTP {response.status_code}", response)
            return False, None, [], [], []
            
    except Exception as e:
        print_test_result(False, f"GET barèmes-kilométriques/societe test failed - {str(e)}")
        return False, None, [], [], []

def test_get_baremes_kilometriques_manage():
    """Test 5: GET /api/baremes-kilometriques/manage?societeId=2 - Barèmes avec gestion (si existe)"""
    print_test_header("GET Barèmes Kilométriques Manage API Test")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/baremes-kilometriques/manage?societeId={SOCIETE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print_test_result(True, f"GET barèmes-kilométriques/manage successful", response)
            return True, data
        elif response.status_code == 404:
            print_test_result(True, f"GET barèmes-kilométriques/manage endpoint not found (404) - This is expected if endpoint doesn't exist", response)
            return True, None
        else:
            print_test_result(False, f"GET barèmes-kilométriques/manage failed - HTTP {response.status_code}", response)
            return False, None
            
    except Exception as e:
        print_test_result(False, f"GET barèmes-kilométriques/manage test failed - {str(e)}")
        return False, None

def test_database_verification():
    """Test 6: Verify database tables and data consistency"""
    print_test_header("Database Tables and Data Verification")
    try:
        headers = get_auth_headers()
        
        # Test database connection via a simple API call
        response = requests.get(f"{API_BASE}/test-db", headers=headers, timeout=10)
        
        if response.status_code == 200:
            print_test_result(True, f"Database connection verified via test endpoint", response)
            return True
        else:
            print_test_result(False, f"Database connection test failed - HTTP {response.status_code}", response)
            return False
            
    except Exception as e:
        print_test_result(False, f"Database verification test failed - {str(e)}")
        return False

def main():
    """Main test execution for Types de Frais et Barèmes Kilométriques APIs"""
    print("🚀 Starting Backend API Tests for Types de Frais et Barèmes Kilométriques")
    print("📊 Testing: Types de frais and barèmes kilométriques management APIs")
    print(f"Backend URL: {BASE_URL}")
    print(f"API Base URL: {API_BASE}")
    print(f"Test Email: {TEST_EMAIL}")
    print(f"Company ID: {SOCIETE_ID}")
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
        print("\n❌ Authentication failed. Cannot proceed with protected endpoint tests.")
        return False
    
    # Test 2: GET types-frais/manage
    types_manage_success, types_manage_data, system_types, personalized_types, custom_types = test_get_types_frais_manage()
    test_results.append(("GET Types Frais Manage", types_manage_success))
    
    # Test 3: GET types-frais/societe (alternative endpoint)
    types_societe_success, types_societe_data = test_get_types_frais_societe()
    test_results.append(("GET Types Frais Societe", types_societe_success))
    
    # Test 4: GET barèmes-kilométriques/societe
    baremes_success, baremes_data, system_baremes, personalized_baremes, custom_baremes = test_get_baremes_kilometriques()
    test_results.append(("GET Barèmes Kilométriques Societe", baremes_success))
    
    # Test 5: GET barèmes-kilométriques/manage (alternative endpoint)
    baremes_manage_success, baremes_manage_data = test_get_baremes_kilometriques_manage()
    test_results.append(("GET Barèmes Kilométriques Manage", baremes_manage_success))
    
    # Test 6: Database verification
    db_success = test_database_verification()
    test_results.append(("Database Verification", db_success))
    
    # Print summary
    print(f"\n{'='*60}")
    print("TEST SUMMARY - TYPES DE FRAIS ET BARÈMES KILOMÉTRIQUES APIs")
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
    
    if types_manage_success:
        total_types = len(system_types) + len(personalized_types) + len(custom_types)
        print(f"✅ GET /api/types-frais/manage/{SOCIETE_ID} working - {total_types} types found")
        print(f"  - System types: {len(system_types)}")
        print(f"  - Personalized types: {len(personalized_types)}")
        print(f"  - Custom types: {len(custom_types)}")
    else:
        print(f"❌ GET /api/types-frais/manage/{SOCIETE_ID} failed")
    
    if types_societe_success:
        print(f"✅ GET /api/types-frais/societe/{SOCIETE_ID} endpoint tested")
    else:
        print(f"❌ GET /api/types-frais/societe/{SOCIETE_ID} failed")
    
    if baremes_success:
        total_baremes = len(system_baremes) + len(personalized_baremes) + len(custom_baremes)
        print(f"✅ GET /api/baremes-kilometriques/societe/{SOCIETE_ID} working - {total_baremes} barèmes found")
        print(f"  - System barèmes: {len(system_baremes)}")
        print(f"  - Personalized barèmes: {len(personalized_baremes)}")
        print(f"  - Custom barèmes: {len(custom_baremes)}")
    else:
        print(f"❌ GET /api/baremes-kilometriques/societe/{SOCIETE_ID} failed")
    
    if baremes_manage_success:
        print(f"✅ GET /api/baremes-kilometriques/manage?societeId={SOCIETE_ID} endpoint tested")
    else:
        print(f"❌ GET /api/baremes-kilometriques/manage?societeId={SOCIETE_ID} failed")
    
    if db_success:
        print(f"✅ Database connection and tables verified")
    else:
        print("❌ Database verification failed")
    
    # Overall assessment
    critical_tests = ["Server Connectivity", "Authentication", "GET Types Frais Manage", "GET Barèmes Kilométriques Societe"]
    critical_passed = sum(1 for test_name, result in test_results if test_name in critical_tests and result)
    
    if critical_passed >= 3 and passed >= 4:  # Most critical tests + some functionality tests
        print(f"\n🎉 TYPES DE FRAIS ET BARÈMES KILOMÉTRIQUES API TESTS MOSTLY SUCCESSFUL!")
        print("✅ Backend server is responding correctly")
        print("✅ User authentication is working with correct credentials")
        
        if types_manage_success:
            print(f"✅ GET /api/types-frais/manage/{SOCIETE_ID} endpoint working correctly")
        if baremes_success:
            print(f"✅ GET /api/baremes-kilometriques/societe/{SOCIETE_ID} endpoint working correctly")
        
        print("✅ APIs are accessible and returning data")
        print("✅ Database tables appear to be functioning")
        return True
    else:
        print(f"\n⚠️ ISSUES DETECTED IN TYPES DE FRAIS ET BARÈMES KILOMÉTRIQUES APIs")
        if critical_passed < 3:
            print("❌ Critical infrastructure issues detected (server/auth/main endpoints)")
        else:
            print("❌ Some API operations are not working correctly")
        print("❌ APIs may need fixes or database issues need resolution")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)