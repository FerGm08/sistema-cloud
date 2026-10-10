import { useState } from 'react';

const USUARIO = 'admin';
const PASSWORD = '12345';

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const entrar = (e) => {
    e.preventDefault();
    if (usuario === USUARIO && password === PASSWORD) onLogin();
    else setError('Usuario o contraseña incorrectos');
  };

  return (
    <div className="login-wrap">
      <form className="card login" onSubmit={entrar}>
        <h1>☁️ SISTEMA CLOUD</h1>
        <label>Usuario</label>
        <input value={usuario} onChange={(e) => setUsuario(e.target.value)} />
        <label>Contraseña</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="error">{error}</p>}
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
}
