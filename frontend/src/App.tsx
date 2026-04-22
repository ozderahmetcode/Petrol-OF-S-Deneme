import React, { useState, useEffect } from 'react';
import './styles/GlobalStyles.css';
import { WebAdapter } from './services/hardware/WebAdapter';
import { ElectronAdapter } from './services/hardware/ElectronAdapter';
import { IHardwareService } from './services/hardware/HardwareInterface';
import { io } from 'socket.io-client';


const isElectron = !!(window as any).electron;
const hardware: IHardwareService = isElectron ? new ElectronAdapter() : new WebAdapter();

// Socket Connection
const socket = io('http://localhost:3000');

interface BasketItem {
  name: string;
  quantity: number;
  price: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'POS' | 'TASKS' | 'FINANCE' | 'REPORTS'>('POS');
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [livePumps, setLivePumps] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Giriş başarısız');
      }

      const data = await response.json();
      setIsLoggedIn(true);
      setUser(data.user);
      // Token state'de veya localstorage'da saklanabilir
      localStorage.setItem('token', data.access_token);
    } catch (err: any) {
      setLoginError(err.message);
      addNotification(err.message, 'error');
    }
  };

  const addNotification = (msg: string, type: 'info' | 'warning' | 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Listen for pump updates
  useEffect(() => {
    socket.on('pumps:update', (data) => {
      setLivePumps(data);
    });

    // Simulate SKT Alert for demo
    setTimeout(() => {
      addNotification('Kritik: "Sandviç - Tavuklu" SKT\'sine 3 gün kaldı!', 'warning');
    }, 10000);

    return () => { socket.off('pumps:update'); };
  }, []);

  const addToBasket = (name: string, price: number) => {
    setBasket([...basket, { name, quantity: 1, price }]);
  };

  const calculateTotals = () => {
    const gross = basket.reduce((acc, item) => acc + item.price, 0);
    const discount = gross > 1500 ? gross * 0.05 : 0;
    return { gross, discount, net: gross - discount };
  };

  const totals = calculateTotals();

  const handlePrint = async () => {
    await hardware.printReceipt({
      items: basket,
      total: totals.net,
      discount: totals.discount,
      tax: totals.net * 0.2,
      paymentType: 'CREDIT_CARD',
      date: new Date().toLocaleString()
    });
  };

  if (!isLoggedIn) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #1a1a1a 0%, #000 100%)' }}>
        <div className="card" style={{ width: '400px', padding: '40px', textAlign: 'center' }}>
          <img src="/petrol_ofisi_logo_stylized.png" alt="PO Logo" style={{ height: '80px', marginBottom: '30px' }} />
          <h2 style={{ marginBottom: '30px', letterSpacing: '1px' }}>PERSONEL GİRİŞİ</h2>
          {loginError && <div style={{ color: 'var(--error)', marginBottom: '20px', fontSize: '0.9rem' }}>{loginError}</div>}
          <form onSubmit={handleLogin} style={{ display: 'grid', gap: '20px' }}>
            <input 
              type="text" 
              placeholder="Kullanıcı Adı" 
              className="card" 
              style={{ background: '#000', border: '1px solid var(--border-color)', padding: '15px', color: '#fff' }} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Şifre" 
              className="card" 
              style={{ background: '#000', border: '1px solid var(--border-color)', padding: '15px', color: '#fff' }} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '15px' }}>SİSTEME GİRİŞ YAP</button>
          </form>
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>v1.2.4-stable | Terminal PO-IST-0422</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '40px' }}>
      <header className="nav-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img 
            src="/petrol_ofisi_logo_stylized.png" 
            alt="Petrol Ofisi" 
            style={{ height: '45px', objectFit: 'contain' }} 
          />
          <div>
            <h1 style={{ color: 'var(--po-red)', fontSize: '1.5rem', fontWeight: 900 }}>ozder</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Petrol Ofisi ERP Solution
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>{user?.username}</div>
            <div style={{ color: 'var(--po-red)', fontSize: '0.7rem' }}>{user?.role}</div>
          </div>
          <nav style={{ display: 'flex', gap: '15px' }}>
            {['POS', 'TASKS', 'FINANCE', 'REPORTS'].map((tab) => (
              <button 
                key={tab}
                className={`btn-primary ${activeTab === tab ? '' : 'inactive'}`}
                onClick={() => setActiveTab(tab as any)}
              >
                {tab === 'POS' ? 'Akıllı Kasa' : tab === 'TASKS' ? 'Saha Görevleri' : tab === 'FINANCE' ? 'Finans' : 'Yönetim Raporu'}
              </button>
            ))}
          </nav>
          <button onClick={() => setIsLoggedIn(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Çıkış</button>
        </div>
      </header>

      <main style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
          Terminal: <span style={{ color: 'var(--po-red)', fontWeight: 'bold' }}>PO-IST-0422</span> | 
          Mod: <span style={{ color: isElectron ? 'var(--success)' : 'var(--accent-gold)' }}>
            {isElectron ? 'ELECTRON MASAÜSTÜ' : 'STANDART WEB'}
          </span>
        </p>

      {/* Notifications Toast */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, display: 'grid', gap: '10px' }}>
        {notifications.map(n => (
          <div key={n.id} className="card" style={{ 
            background: n.type === 'warning' ? 'var(--error)' : 'var(--bg-secondary)', 
            color: '#fff',
            minWidth: '300px',
            animation: 'slideIn 0.3s ease-out'
          }}>
            {n.msg}
          </div>
        ))}
      </div>

      {activeTab === 'POS' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
          <div className="card">
            <h2 style={{ marginBottom: '20px' }}>Market & Yakıt</h2>
            <div className="touch-grid">
              {[
                { name: 'Benzin 95', price: 1800 },
                { name: 'Motorin', price: 1600 },
                { name: 'Su 0.5L', price: 10 },
                { name: 'Sandviç', price: 85 },
                { name: 'Lojistik Yakıt', price: 2000 },
                { name: 'Antifriz', price: 450 }
              ].map(item => (
                <button 
                  key={item.name} 
                  className="card" 
                  style={{ cursor: 'pointer', textAlign: 'center', height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  onClick={() => addToBasket(item.name, item.price)}
                >
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ color: 'var(--accent-gold)', marginTop: '5px' }}>{item.price} TL</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
            {/* Live Pumps Panel */}
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                İstasyon Saha Durumu (Canlı)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {livePumps.map((pump) => (
                  <div 
                    key={pump.pumpId} 
                    className="card" 
                    style={{ 
                      padding: '10px', 
                      textAlign: 'center', 
                      background: pump.status === 'FILLING' ? 'rgba(16, 185, 129, 0.1)' : 
                                 pump.status === 'WAITING_PAYMENT' ? 'rgba(239, 68, 68, 0.2)' :
                                 pump.status === 'CLOSED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)',
                      borderColor: pump.status === 'FILLING' ? 'var(--success)' : 
                                  pump.status === 'WAITING_PAYMENT' ? 'var(--error)' :
                                  pump.status === 'CLOSED' ? 'var(--error)' : 'var(--border-color)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    {pump.status === 'FILLING' && (
                      <div className="pulse-dot" style={{ position: 'absolute', top: '5px', right: '5px' }}></div>
                    )}
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>P{pump.pumpId}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', color: (pump.status === 'CLOSED' || pump.status === 'WAITING_PAYMENT') ? 'var(--error)' : 'inherit' }}>
                      {pump.status === 'FILLING' ? `${pump.amount} TL` : 
                       pump.status === 'WAITING_PAYMENT' ? 'BİTTİ' :
                       pump.status === 'CLOSED' ? 'KAPALI' : 'BOŞTA'}
                    </div>
                    {(pump.status === 'FILLING' || pump.status === 'WAITING_PAYMENT') && (
                      <button 
                        style={{ width: '100%', marginTop: '5px', padding: '2px', fontSize: '0.6rem', background: pump.status === 'WAITING_PAYMENT' ? 'var(--error)' : 'var(--success)', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => {
                          addToBasket(`Pompa ${pump.pumpId} - Yakıt`, Number(pump.amount));
                          if (pump.status === 'WAITING_PAYMENT') {
                            socket.emit('pumps:pay', { pumpId: pump.pumpId });
                          }
                        }}
                      >
                        {pump.status === 'WAITING_PAYMENT' ? 'ÖDEME AL' : 'EKLE'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <h2 style={{ marginBottom: '20px', borderLeft: '4px solid var(--po-red)', paddingLeft: '15px' }}>Güncel Sepet</h2>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
              {basket.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <span>{item.name}</span>
                  <span style={{ fontWeight: 'bold' }}>{item.price.toFixed(2)} TL</span>
                </div>
              ))}
            </div>
            
            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Ara Toplam:</span>
                <span>{totals.gross.toFixed(2)} TL</span>
              </div>
              {totals.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--success)' }}>
                  <span>Otomatik İndirim:</span>
                  <span>-{totals.discount.toFixed(2)} TL</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-gold)', fontSize: '1.4rem', fontWeight: 'bold' }}>
                <span>TOPLAM:</span>
                <span>{totals.net.toFixed(2)} TL</span>
              </div>
            </div>

            <button className="btn-primary" onClick={handlePrint} style={{ width: '100%', padding: '20px', fontSize: '1.1rem' }}>
              ÖDEME & YAZDIR
            </button>
          </div>
        </div>
      )}

      {activeTab === 'TASKS' && (
        <div className="card">
          <h2 style={{ marginBottom: '30px' }}>Operasyonel Görevler (Hijyen Plus)</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {[
              { id: '1', title: '3 Numaralı Tuvalet Kontrolü', time: '18:30', status: 'Pending' },
              { id: '2', title: 'Market Önü Çöp Kovası Boşaltma', time: '19:00', status: 'Pending' },
              { id: '3', title: 'Kahve Makinesi Temizliği', time: '20:00', status: 'Pending' }
            ].map(task => (
              <div key={task.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{task.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Planlanan: {task.time}</div>
                </div>
                <button className="btn-primary" style={{ padding: '8px 20px' }}>TAMAMLA (Log)</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'FINANCE' && (
        <div className="card">
          <h2 style={{ marginBottom: '30px' }}>Vardiya Mutabakatı (Virtual Shift)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div className="card" style={{ border: 'none', background: 'rgba(255,255,255,0.05)' }}>
              <h3>Sanal Vardiya Özeti</h3>
              <div style={{ marginTop: '20px' }}>
                <p style={{ marginBottom: '10px' }}>Başlangıç: 14:30</p>
                <p style={{ marginBottom: '10px' }}>Kasiyer: Ahmet Ö.</p>
                <p style={{ fontSize: '1.5rem', marginTop: '20px' }}>Beklenen: <span style={{ color: 'var(--accent-gold)' }}>15,450.50 TL</span></p>
              </div>
            </div>
            <div className="card">
              <h3>Kasa Teslim</h3>
              <div style={{ marginTop: '20px', display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Nakit Tutar:</label>
                  <input type="number" className="card" style={{ width: '100%', background: 'var(--bg-primary)', color: '#fff', border: '1px solid var(--border-color)', padding: '10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px' }}>Slip Toplamı:</label>
                  <input type="number" className="card" style={{ width: '100%', background: 'var(--bg-primary)', color: '#fff', border: '1px solid var(--border-color)', padding: '10px' }} />
                </div>
                <button className="btn-primary" style={{ marginTop: '10px' }}>VARDİYAYI KAPAT & KARŞILAŞTIR</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'REPORTS' && (
        <div className="card">
          <h2 style={{ marginBottom: '30px' }}>Yönetici Raporları</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Günlük Satış</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>125,400 TL</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Yakıt Litre</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>4,250 L</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>Market Ciro</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>12,400 TL</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)' }}>İndirim Tutarı</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--error)' }}>6,270 TL</div>
            </div>
          </div>

          <div className="card">
            <h3>En Çok Satan Ürünler</h3>
            <div style={{ marginTop: '20px' }}>
              {[
                { name: 'Kurşunsuz 95', val: 85 },
                { name: 'Motorin', val: 32 },
                { name: 'Su 0.5L', val: 12 },
                { name: 'Sandviç', val: 8 }
              ].map(p => (
                <div key={p.name} style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{p.name}</span>
                    <span>%{p.val}</span>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', height: '10px', borderRadius: '5px' }}>
                    <div style={{ background: 'var(--accent-gold)', height: '100%', width: `${p.val}%`, borderRadius: '5px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

export default App;
