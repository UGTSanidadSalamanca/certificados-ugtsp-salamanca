import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const cred = await signInWithPopup(auth, provider);
      
      // Ensure the profile exists
      const userDocRef = doc(db, 'profiles', cred.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        const email = cred.user.email || '';
        await setDoc(userDocRef, {
          full_name: cred.user.displayName || email.split('@')[0],
          role: email === 'fespugtsalamanca@gmail.com' ? 'superadmin' : 'consulta',
          created_at: Date.now(),
          updated_at: Date.now()
        });
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error de autenticación con Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="bg-red-600 inline-flex p-3 rounded-xl mb-4 shadow-sm">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">UGT SP</h1>
          <p className="text-slate-500 mt-2">Sistema Interno de Certificaciones</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50">
          <CardHeader>
            <CardTitle>Acceso al Panel</CardTitle>
            <CardDescription>
              Inicia sesión con tu cuenta de Google (Gmail o corporativo de UGT).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleGoogleLogin} 
                className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2" 
                disabled={loading}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                {loading ? 'Conectando...' : 'Acceder con Google'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
