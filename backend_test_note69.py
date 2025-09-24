#!/usr/bin/env python3
"""
Investigation spécifique pour la note de frais ID 69 - Problème de persistance des justificatifs OCR
Tests demandés par l'utilisateur pour analyser le problème de justificatifs qui disparaissent.

INVESTIGATION SPÉCIFIQUE POUR NOTE 69:
1. Connexion avec idnovation2014@gmail.com / Cinema12
2. Analyser la note de frais 69 (GET /api/note-frais/69)
3. Vérifier la base de données pour les justificatifs
4. Tester les endpoints de justificatifs
5. Analyser le frais "Repas - Client" mentionné

Objectif: Identifier précisément où le processus de sauvegarde/récupération des justificatifs échoue
"""

import requests
import json
import sys
import os
from datetime import datetime

# Backend URL configuration - Using production URL from frontend/.env
REACT_APP_BACKEND_URL = "https://fintrack-196.preview.emergentagent.com"
BASE_URL = REACT_APP_BACKEND_URL
API_BASE = f"{BASE_URL}/api"

# Test credentials from user request - UPDATED PASSWORD
TEST_EMAIL = "idnovation2014@gmail.com"
TEST_PASSWORD = "Cinema12"  # Password as specified in request
AUTH_TOKEN = None  # Will be set after login
USER_DATA = None  # Will be set after login
NOTE_ID = 69  # Note ID to investigate as specified in request

def print_test_header(test_name):
    """Print formatted test header"""
    print(f"\n{'='*80}")
    print(f"🔍 INVESTIGATION: {test_name}")
    print(f"{'='*80}")

def print_test_result(success, message, response=None, data=None):
    """Print formatted test result"""
    status = "✅ SUCCÈS" if success else "❌ ÉCHEC"
    print(f"{status}: {message}")
    if response and hasattr(response, 'status_code'):
        print(f"📊 Status Code: {response.status_code}")
        if response.headers.get('content-type', '').startswith('application/json'):
            try:
                json_data = response.json()
                print(f"📄 Response: {json.dumps(json_data, indent=2, ensure_ascii=False)}")
                return json_data
            except:
                print(f"📄 Response Text: {response.text}")
        else:
            print(f"📄 Response Text: {response.text}")
    if data:
        print(f"📋 Data: {json.dumps(data, indent=2, ensure_ascii=False)}")
    print("-" * 80)
    return None

def get_auth_headers():
    """Get authentication headers if token is available"""
    if AUTH_TOKEN:
        return {'Authorization': f'Bearer {AUTH_TOKEN}'}
    return {}

def test_server_connectivity():
    """Test 0: Verify backend server is responding"""
    print_test_header("Connectivité du serveur backend")
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200:
            print_test_result(True, f"Serveur backend répond correctement sur {BASE_URL}", response)
            return True
        else:
            print_test_result(False, f"Serveur backend retourne un statut inattendu: {response.status_code}", response)
            return False
    except Exception as e:
        print_test_result(False, f"Échec de connectivité du serveur backend - {str(e)}")
        return False

def test_authentication():
    """Test 1: Authentication with specified credentials"""
    global AUTH_TOKEN, USER_DATA
    print_test_header("Authentification utilisateur - idnovation2014@gmail.com / Cinema12")
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
                print_test_result(True, f"Authentification réussie - User ID: {user_id}, Company ID: {societe_id}, Permissions: {len(permissions)}", response)
                return True, data
            else:
                print_test_result(False, f"Réponse d'authentification manque des champs requis", response)
                return False, None
        else:
            print_test_result(False, f"Échec d'authentification - HTTP {response.status_code}", response)
            return False, None
    except Exception as e:
        print_test_result(False, f"Test d'authentification échoué - {str(e)}")
        return False, None

def test_get_note_frais_69():
    """Test 2: GET /api/note-frais/69 - Récupérer tous les détails de la note 69"""
    print_test_header("Récupération de la note de frais 69")
    try:
        headers = get_auth_headers()
        
        response = requests.get(f"{API_BASE}/note-frais/{NOTE_ID}", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = print_test_result(True, f"Note de frais {NOTE_ID} récupérée avec succès", response)
            
            if data and 'note' in data:
                note = data['note']
                lignes_frais = note.get('lignes_frais', [])
                
                print(f"\n📋 ANALYSE DE LA NOTE {NOTE_ID}:")
                print(f"   - Numéro: {note.get('numero', 'N/A')}")
                print(f"   - Utilisateur: {note.get('firstName', '')} {note.get('lastName', '')}")
                print(f"   - Statut: {note.get('statut', 'N/A')}")
                print(f"   - Montant total: {note.get('montant_total', 'N/A')}€")
                print(f"   - Nombre de lignes de frais: {len(lignes_frais)}")
                
                # Analyser chaque ligne de frais
                for i, ligne in enumerate(lignes_frais):
                    print(f"\n   📝 LIGNE DE FRAIS {i+1} (ID: {ligne.get('id')}):")
                    print(f"      - Type: {ligne.get('type_frais_nom', 'N/A')}")
                    print(f"      - Montant: {ligne.get('montant_ttc', 'N/A')}€")
                    print(f"      - Vendeur: {ligne.get('vendeur', 'N/A')}")
                    print(f"      - Description: {ligne.get('description', 'N/A')}")
                    
                    justificatifs = ligne.get('justificatifs', [])
                    print(f"      - Nombre de justificatifs: {len(justificatifs)}")
                    
                    if justificatifs:
                        for j, justif in enumerate(justificatifs):
                            print(f"         📎 JUSTIFICATIF {j+1}:")
                            print(f"            - ID: {justif.get('id')}")
                            print(f"            - Nom: {justif.get('nom_fichier')}")
                            print(f"            - URL: {justif.get('url')}")
                            print(f"            - Type: {justif.get('type_mime')}")
                            print(f"            - Taille: {justif.get('taille_fichier')} bytes")
                    else:
                        print(f"         ⚠️ AUCUN JUSTIFICATIF TROUVÉ")
                
                return True, data, lignes_frais
            else:
                print_test_result(False, f"Structure de réponse invalide - pas de champ 'note'", response)
                return False, None, []
        elif response.status_code == 404:
            print_test_result(False, f"Note de frais {NOTE_ID} non trouvée (404)", response)
            return False, None, []
        else:
            print_test_result(False, f"Échec récupération note {NOTE_ID} - HTTP {response.status_code}", response)
            return False, None, []
            
    except Exception as e:
        print_test_result(False, f"Test récupération note {NOTE_ID} échoué - {str(e)}")
        return False, None, []

def test_frais_justificatifs(lignes_frais):
    """Test 3: Tester les endpoints de justificatifs pour chaque frais"""
    print_test_header("Test des endpoints de justificatifs pour chaque frais")
    
    if not lignes_frais:
        print_test_result(False, "Aucune ligne de frais à tester")
        return False
    
    all_success = True
    headers = get_auth_headers()
    
    for ligne in lignes_frais:
        frais_id = ligne.get('id')
        type_frais = ligne.get('type_frais_nom', 'N/A')
        
        print(f"\n🔍 Test justificatifs pour frais ID {frais_id} ({type_frais}):")
        
        try:
            response = requests.get(f"{API_BASE}/frais/{frais_id}/justificatifs", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = print_test_result(True, f"Justificatifs récupérés pour frais {frais_id}", response)
                
                if data and 'justificatifs' in data:
                    justificatifs = data['justificatifs']
                    print(f"   📎 {len(justificatifs)} justificatif(s) trouvé(s)")
                    
                    for justif in justificatifs:
                        print(f"      - {justif.get('nom_fichier')} ({justif.get('type_mime')})")
                        print(f"        URL: {justif.get('url')}")
                        
                        # Tester l'accessibilité du fichier
                        file_url = f"{BASE_URL}{justif.get('url')}"
                        try:
                            file_response = requests.head(file_url, timeout=5)
                            if file_response.status_code == 200:
                                print(f"        ✅ Fichier accessible (HTTP {file_response.status_code})")
                            else:
                                print(f"        ❌ Fichier non accessible (HTTP {file_response.status_code})")
                                all_success = False
                        except Exception as e:
                            print(f"        ❌ Erreur accès fichier: {str(e)}")
                            all_success = False
                else:
                    print(f"   ⚠️ Structure de réponse invalide")
                    all_success = False
            else:
                print_test_result(False, f"Échec récupération justificatifs frais {frais_id} - HTTP {response.status_code}", response)
                all_success = False
                
        except Exception as e:
            print_test_result(False, f"Erreur test justificatifs frais {frais_id} - {str(e)}")
            all_success = False
    
    return all_success

def test_upload_justificatif_endpoint():
    """Test 4: Tester l'endpoint POST /api/frais/upload-justificatif"""
    print_test_header("Test de l'endpoint d'upload de justificatif")
    try:
        headers = get_auth_headers()
        
        # Test sans fichier pour vérifier que l'endpoint existe
        response = requests.post(f"{API_BASE}/frais/upload-justificatif", headers=headers, timeout=10)
        
        if response.status_code == 400:
            data = print_test_result(True, f"Endpoint upload-justificatif existe et répond correctement (400 = fichier manquant attendu)", response)
            return True
        elif response.status_code == 404:
            print_test_result(False, f"Endpoint upload-justificatif non trouvé (404)", response)
            return False
        else:
            print_test_result(True, f"Endpoint upload-justificatif existe - Status: {response.status_code}", response)
            return True
            
    except Exception as e:
        print_test_result(False, f"Test endpoint upload-justificatif échoué - {str(e)}")
        return False

def analyze_repas_client_frais(lignes_frais):
    """Test 5: Analyser spécifiquement le frais 'Repas - Client' mentionné"""
    print_test_header("Analyse du frais 'Repas - Client' mentionné")
    
    repas_client_found = False
    repas_frais = []
    
    # Chercher tous les frais de type repas
    for ligne in lignes_frais:
        type_frais = ligne.get('type_frais_nom', '').lower()
        if 'repas' in type_frais or 'client' in type_frais:
            repas_frais.append(ligne)
            if 'repas' in type_frais and 'client' in type_frais:
                repas_client_found = True
    
    if repas_client_found:
        print_test_result(True, f"Frais 'Repas - Client' trouvé dans la note {NOTE_ID}")
    else:
        print(f"⚠️ Frais 'Repas - Client' exact non trouvé, mais {len(repas_frais)} frais de repas trouvés:")
    
    for frais in repas_frais:
        print(f"\n📝 FRAIS DE REPAS ANALYSÉ:")
        print(f"   - ID: {frais.get('id')}")
        print(f"   - Type: {frais.get('type_frais_nom')}")
        print(f"   - Montant: {frais.get('montant_ttc')}€")
        print(f"   - Vendeur: {frais.get('vendeur')}")
        print(f"   - Description: {frais.get('description')}")
        
        justificatifs = frais.get('justificatifs', [])
        print(f"   - Justificatifs: {len(justificatifs)}")
        
        if justificatifs:
            for justif in justificatifs:
                print(f"      📎 {justif.get('nom_fichier')}")
                print(f"         URL: {justif.get('url')}")
                print(f"         Chemin: {justif.get('chemin_fichier')}")
        else:
            print(f"      ❌ AUCUN JUSTIFICATIF - C'EST LE PROBLÈME!")
    
    return len(repas_frais) > 0

def test_database_consistency():
    """Test 6: Vérifier la cohérence de la base de données via les APIs"""
    print_test_header("Vérification de la cohérence de la base de données")
    
    try:
        headers = get_auth_headers()
        
        # Test de connectivité DB via un endpoint simple
        response = requests.get(f"{API_BASE}/test-db", headers=headers, timeout=10)
        
        if response.status_code == 200:
            print_test_result(True, f"Connexion base de données vérifiée", response)
            return True
        else:
            print_test_result(False, f"Test connexion DB échoué - HTTP {response.status_code}", response)
            return False
            
    except Exception as e:
        print_test_result(False, f"Test cohérence DB échoué - {str(e)}")
        return False

def main():
    """Investigation principale pour la note de frais 69"""
    print("🔍 INVESTIGATION SPÉCIFIQUE - PROBLÈME JUSTIFICATIFS NOTE 69")
    print("=" * 80)
    print("📋 OBJECTIF: Identifier où le processus de sauvegarde/récupération des justificatifs échoue")
    print(f"🌐 Backend URL: {BASE_URL}")
    print(f"📧 Email de test: {TEST_EMAIL}")
    print(f"🔑 Mot de passe: {TEST_PASSWORD}")
    print(f"📝 Note à investiguer: {NOTE_ID}")
    print(f"⏰ Heure du test: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 80)
    
    # Track test results
    test_results = []
    
    # Test 0: Server connectivity
    server_ok = test_server_connectivity()
    test_results.append(("Connectivité serveur", server_ok))
    
    if not server_ok:
        print("\n❌ Le serveur backend ne répond pas. Arrêt des tests.")
        return False
    
    # Test 1: Authentication
    auth_success, auth_data = test_authentication()
    test_results.append(("Authentification", auth_success))
    
    if not auth_success:
        print("\n❌ Échec d'authentification. Impossible de continuer les tests.")
        return False
    
    # Test 2: Get note frais 69
    note_success, note_data, lignes_frais = test_get_note_frais_69()
    test_results.append(("Récupération note 69", note_success))
    
    # Test 3: Test justificatifs endpoints
    justif_success = test_frais_justificatifs(lignes_frais) if note_success else False
    test_results.append(("Endpoints justificatifs", justif_success))
    
    # Test 4: Test upload endpoint
    upload_success = test_upload_justificatif_endpoint()
    test_results.append(("Endpoint upload", upload_success))
    
    # Test 5: Analyze repas client
    repas_success = analyze_repas_client_frais(lignes_frais) if note_success else False
    test_results.append(("Analyse Repas - Client", repas_success))
    
    # Test 6: Database consistency
    db_success = test_database_consistency()
    test_results.append(("Cohérence base de données", db_success))
    
    # Print summary
    print(f"\n{'='*80}")
    print("📊 RÉSUMÉ DE L'INVESTIGATION - NOTE 69")
    print(f"{'='*80}")
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ SUCCÈS" if result else "❌ ÉCHEC"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\nRésultats: {passed}/{total} tests réussis")
    
    # Detailed analysis
    print(f"\n{'='*80}")
    print("🔍 ANALYSE DÉTAILLÉE DU PROBLÈME")
    print(f"{'='*80}")
    
    if auth_success and USER_DATA:
        user_id = USER_DATA.get('id')
        societe_id = USER_DATA.get('societe_id')
        print(f"✅ Utilisateur connecté: ID {user_id}, Société {societe_id}")
    
    if note_success:
        print(f"✅ Note {NOTE_ID} existe et est accessible")
        if lignes_frais:
            total_justifs = sum(len(ligne.get('justificatifs', [])) for ligne in lignes_frais)
            print(f"📊 {len(lignes_frais)} ligne(s) de frais, {total_justifs} justificatif(s) total")
            
            # Identifier les lignes sans justificatifs
            lignes_sans_justifs = [ligne for ligne in lignes_frais if not ligne.get('justificatifs')]
            if lignes_sans_justifs:
                print(f"⚠️ {len(lignes_sans_justifs)} ligne(s) de frais SANS justificatifs:")
                for ligne in lignes_sans_justifs:
                    print(f"   - ID {ligne.get('id')}: {ligne.get('type_frais_nom')} ({ligne.get('montant_ttc')}€)")
        else:
            print(f"❌ Note {NOTE_ID} n'a aucune ligne de frais")
    else:
        print(f"❌ Note {NOTE_ID} non trouvée ou inaccessible")
    
    if upload_success:
        print(f"✅ Endpoint d'upload de justificatifs disponible")
    else:
        print(f"❌ Endpoint d'upload de justificatifs non disponible")
    
    # Diagnostic final
    print(f"\n{'='*80}")
    print("🎯 DIAGNOSTIC FINAL")
    print(f"{'='*80}")
    
    if note_success and lignes_frais:
        lignes_avec_justifs = [ligne for ligne in lignes_frais if ligne.get('justificatifs')]
        lignes_sans_justifs = [ligne for ligne in lignes_frais if not ligne.get('justificatifs')]
        
        if lignes_sans_justifs:
            print("❌ PROBLÈME IDENTIFIÉ: Des lignes de frais n'ont pas de justificatifs")
            print("🔍 CAUSES POSSIBLES:")
            print("   1. Échec de sauvegarde lors de l'upload OCR")
            print("   2. Problème d'association justificatif ↔ ligne de frais")
            print("   3. Suppression accidentelle des justificatifs")
            print("   4. Problème de permissions d'accès aux fichiers")
            
            print("\n🛠️ ACTIONS RECOMMANDÉES:")
            print("   1. Vérifier les logs d'upload OCR")
            print("   2. Contrôler la table justificatifs_frais en base")
            print("   3. Vérifier l'existence des fichiers sur le serveur")
            print("   4. Tester l'upload manuel d'un justificatif")
        else:
            print("✅ AUCUN PROBLÈME DÉTECTÉ: Tous les frais ont leurs justificatifs")
    else:
        print("❌ IMPOSSIBLE DE DIAGNOSTIQUER: Note non accessible")
    
    return passed >= 4  # Au moins 4 tests sur 6 doivent passer

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)