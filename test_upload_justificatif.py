#!/usr/bin/env python3
"""
Test d'upload de justificatif pour diagnostiquer le problème de persistance
"""

import requests
import json
import io
import sys

# Configuration
REACT_APP_BACKEND_URL = "https://expense-ocr-sys.preview.emergentagent.com"
API_BASE = f"{REACT_APP_BACKEND_URL}/api"
TEST_EMAIL = "idnovation2014@gmail.com"
TEST_PASSWORD = "Cinema12"

def authenticate():
    """Authenticate and get token"""
    payload = {
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    }
    response = requests.post(f"{API_BASE}/login", json=payload, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        return data.get('token')
    return None

def test_upload_justificatif():
    """Test upload of justificatif to frais ID 22"""
    token = authenticate()
    if not token:
        print("❌ Authentication failed")
        return False
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Create a test file
    test_file_content = b"Test justificatif content for frais 22"
    test_file = io.BytesIO(test_file_content)
    
    # Prepare the upload
    files = {
        'file': ('test-justificatif.pdf', test_file, 'application/pdf')
    }
    
    data = {
        'frais_id': '22',
        'nom_fichier': 'test-justificatif-note69.pdf'
    }
    
    print("🔄 Testing upload to frais ID 22...")
    
    try:
        response = requests.post(
            f"{API_BASE}/frais/upload-justificatif", 
            headers=headers,
            files=files,
            data=data,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📄 Response: {response.text}")
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Upload successful!")
            return True
        else:
            print(f"❌ Upload failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Upload error: {str(e)}")
        return False

def verify_justificatif_saved():
    """Verify if the justificatif was saved in database"""
    token = authenticate()
    if not token:
        return False
    
    headers = {'Authorization': f'Bearer {token}'}
    
    print("🔍 Checking if justificatif was saved...")
    
    try:
        response = requests.get(f"{API_BASE}/frais/22/justificatifs", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            justificatifs = data.get('justificatifs', [])
            print(f"📎 Found {len(justificatifs)} justificatif(s)")
            
            for justif in justificatifs:
                print(f"   - {justif.get('nom_fichier')} ({justif.get('type_mime')})")
            
            return len(justificatifs) > 0
        else:
            print(f"❌ Failed to check justificatifs: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking justificatifs: {str(e)}")
        return False

def main():
    print("🧪 TEST D'UPLOAD DE JUSTIFICATIF - NOTE 69 FRAIS 22")
    print("=" * 60)
    
    # Test upload
    upload_success = test_upload_justificatif()
    
    if upload_success:
        # Verify it was saved
        saved_success = verify_justificatif_saved()
        
        if saved_success:
            print("\n✅ SUCCÈS: Le justificatif a été uploadé et sauvegardé correctement")
            print("🔍 CONCLUSION: Le système d'upload fonctionne, le problème est ailleurs")
        else:
            print("\n❌ PROBLÈME: Upload réussi mais justificatif non trouvé en base")
            print("🔍 CONCLUSION: Problème de sauvegarde en base de données")
    else:
        print("\n❌ PROBLÈME: Échec de l'upload")
        print("🔍 CONCLUSION: Problème au niveau de l'endpoint d'upload")
    
    return upload_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)