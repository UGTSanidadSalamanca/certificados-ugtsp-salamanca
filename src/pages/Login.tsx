import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Ensure the initial profile gets created
        await setDoc(doc(db, 'profiles', cred.user.uid), {
          full_name: email.split('@')[0],
          role: email === 'fespugtsalamanca@gmail.com' ? 'superadmin' : 'consulta',
          created_at: Date.now(),
          updated_at: Date.now()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error de autenticación');
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
              {isSignUp ? "Crea una nueva cuenta para acceder." : "Introduce tus credenciales para acceder."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@ugt-sp.es"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs ml-2">{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? 'Procesando...' : isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button 
                type="button" 
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                }}
              >
                {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
