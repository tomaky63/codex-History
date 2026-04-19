/* 案D: モダンUX + 温かい色(A/Bのパレット)
   - Modernの機能/レイアウトをベースに、背景=クリーム(#f7f3ec), アクセント=ワインレッド(#6e1f2a)
   - タイポはセリフ見出し + サンセリフ本文のハイブリッド
   - 「最近追加」セクションは削除 */

function WarmShell({ currentPath, onNav, children }) {
  const nav = [
    { path:'/', label:'Home' },
    { path:'/cases', label:'事例' },
    { path:'/themes', label:'テーマ' },
    { path:'/notes', label:'パターン' },
    { path:'/compare', label:'比較' },
  ];
  return (
    <div style={{
      fontFamily:'system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic UI", sans-serif',
      background:'#f7f3ec', color:'#1a1a1a', minHeight:'100vh',
    }}>
      <header style={{borderBottom:'1px solid #d9cfb8', background:'rgba(247,243,236,0.92)', backdropFilter:'saturate(180%) blur(10px)', position:'sticky', top:0, zIndex:10}}>
        <div style={{maxWidth:1280, margin:'0 auto', padding:'0 32px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div onClick={()=>onNav('/')} style={{cursor:'pointer', display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:26, height:26, background:'#6e1f2a', borderRadius:6, display:'grid', placeItems:'center', color:'#f7f3ec', fontFamily:'"Noto Serif JP", serif', fontWeight:900, fontSize:14, letterSpacing:'-0.05em'}}>
              史
            </div>
            <span style={{fontFamily:'"Noto Serif JP", serif', fontSize:18, fontWeight:800, letterSpacing:'0.02em'}}>ビジネス史</span>
            <span style={{fontSize:11, color:'#8a7a58', fontFamily:'ui-monospace, monospace', marginLeft:4}}>v0.4</span>
          </div>
          <nav style={{display:'flex', gap:2, fontSize:13}}>
            {nav.map(n => (
              <a key={n.path} href="#" onClick={(e)=>{e.preventDefault();onNav(n.path);}} style={{
                padding:'6px 14px', borderRadius:6, textDecoration:'none',
                color: currentPath===n.path ? '#6e1f2a' : '#52463a',
                background: currentPath===n.path ? '#ede4d1' : 'transparent',
                fontWeight: currentPath===n.path ? 600 : 500,
              }}>{n.label}</a>
            ))}
          </nav>
          <div style={{
            display:'flex', alignItems:'center', gap:6,
            border:'1px solid #d9cfb8', borderRadius:7, padding:'5px 10px',
            fontSize:12, color:'#8a7a58', width:220, background:'#fffdf7',
          }}>
            <span>⌕</span>
            <span style={{flex:1}}>事例・タグを検索</span>
            <span style={{fontFamily:'ui-monospace, monospace', fontSize:10, color:'#a8976f', padding:'1px 5px', border:'1px solid #d9cfb8', borderRadius:3}}>⌘K</span>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer style={{borderTop:'1px solid #d9cfb8', marginTop:96, padding:'28px 0', background:'#efe6d0'}}>
        <div style={{maxWidth:1280, margin:'0 auto', padding:'0 32px', display:'flex', justifyContent:'space-between', fontSize:12, color:'#6e5a3e'}}>
          <div>© 2026 ビジネス史 · 個人学習データベース</div>
          <div style={{display:'flex', gap:20}}>
            <span>RSS</span><span>GitHub</span><span>購読</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function WarmHome({ onNav }) {
  return (
    <div style={{maxWidth:1280, margin:'0 auto', padding:'56px 32px 0'}}>
      <div style={{marginBottom:56, display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:48, alignItems:'center'}}>
        <div>
          <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', border:'1px solid #d9cfb8', borderRadius:999, fontSize:12, color:'#52463a', marginBottom:20, background:'#fffdf7'}}>
            <span style={{width:6, height:6, background:'#6e1f2a', borderRadius:99}}/>
            {window.CASES.length * 5} 事例を収録
          </div>
          <h1 style={{fontFamily:'"Noto Serif JP", serif', fontSize:60, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.08, margin:'0 0 20px'}}>
            産業構造の変化を、<br/>
            <span style={{color:'#6e1f2a'}}>構造化して</span>蓄積する。
          </h1>
          <p style={{fontSize:17, lineHeight:1.75, color:'#52463a', margin:'0 0 28px', maxWidth:520}}>
            事例・テーマ・パターンの三層で記述した、ビジネス史のデータベース。転換点・関連・出典を辿りながら読める。
          </p>
          <div style={{display:'flex', gap:10}}>
            <button onClick={()=>onNav('/cases')} style={{
              background:'#6e1f2a', color:'#fffdf7', border:'none', padding:'11px 20px', borderRadius:7,
              fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            }}>事例を探す</button>
            <button onClick={()=>onNav('/compare')} style={{
              background:'#fffdf7', color:'#1a1a1a', border:'1px solid #d9cfb8', padding:'11px 20px', borderRadius:7,
              fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit',
            }}>比較モード →</button>
          </div>
        </div>

        <div onClick={()=>onNav('/cases/'+window.CASES[0].slug)} style={{
          border:'1px solid #d9cfb8', borderRadius:12, background:'#fffdf7', cursor:'pointer',
          overflow:'hidden', boxShadow:'0 1px 2px rgba(110,31,42,0.04)',
        }}>
          <div style={{padding:'14px 20px', borderBottom:'1px solid #ede4d1', display:'flex', alignItems:'center', gap:8, fontSize:12}}>
            <span style={{color:'#6e1f2a', fontWeight:700, fontFamily:'"Noto Serif JP", serif'}}>◆ 特集</span>
            <span style={{color:'#a8976f'}}>·</span>
            <span style={{color:'#8a7a58', fontFamily:'ui-monospace, monospace'}}>tsmc-foundry-model</span>
          </div>
          <div style={{padding:'22px 22px 0'}}>
            <h3 style={{fontFamily:'"Noto Serif JP", serif', fontSize:24, fontWeight:800, letterSpacing:'-0.015em', margin:'0 0 10px', lineHeight:1.22}}>
              {window.CASES[0].title}
            </h3>
            <p style={{fontSize:13.5, color:'#52463a', lineHeight:1.7, margin:'0 0 16px'}}>
              {window.CASES[0].oneLiner}
            </p>
            <div style={{margin:'0 -4px 16px', position:'relative', padding:'22px 4px 30px', borderTop:'1px solid #ede4d1'}}>
              <div style={{position:'absolute', left:4, right:4, top:'50%', height:1, background:'#d9cfb8'}}/>
              {window.CASES[0].events.map((ev, i) => {
                const total = window.CASES[0].events.length;
                const pct = (i/(total-1))*100;
                return (
                  <div key={i} style={{position:'absolute', left:`calc(${pct}% + ${(0.5-i/(total-1))*8}px)`, top:'50%', transform:'translate(-50%, -50%)'}}>
                    <div style={{width: ev.tp?10:6, height: ev.tp?10:6, background: ev.tp?'#6e1f2a':'#a8976f', borderRadius:99, border:'2px solid #fffdf7', boxShadow:'0 0 0 1px '+(ev.tp?'#6e1f2a':'#a8976f')}}/>
                    <div style={{position:'absolute', top: i%2===0 ? -18 : 14, left:'50%', transform:'translateX(-50%)', fontSize:10, color:'#8a7a58', fontFamily:'ui-monospace, monospace'}}>
                      {ev.year}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{padding:'12px 20px', borderTop:'1px solid #ede4d1', background:'#faf5e8', display:'flex', gap:16, fontSize:11, color:'#8a7a58'}}>
            <span>転換点 <span style={{color:'#1a1a1a', fontWeight:600}}>{window.CASES[0].turningPoints.length}</span></span>
            <span>·</span>
            <span>イベント <span style={{color:'#1a1a1a', fontWeight:600}}>{window.CASES[0].events.length}</span></span>
            <span>·</span>
            <span>{window.CASES[0].periodStart}–{window.CASES[0].periodEnd}</span>
            <span style={{marginLeft:'auto', color:'#6e1f2a', fontWeight:600}}>開く →</span>
          </div>
        </div>
      </div>

      {/* テーマ + パターン 2カラム */}
      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:48, marginBottom:48}}>
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:16}}>
            <h2 style={{fontFamily:'"Noto Serif JP", serif', fontSize:22, fontWeight:800, letterSpacing:'-0.01em', margin:0}}>テーマで読む</h2>
            <a href="#" onClick={(e)=>{e.preventDefault();onNav('/themes');}} style={{fontSize:13, color:'#6e1f2a', textDecoration:'none', fontWeight:500}}>
              すべて →
            </a>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            {window.THEMES.slice(0,6).map(t => (
              <div key={t.slug} onClick={()=>onNav('/themes/'+t.slug)} style={{
                border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:'16px 18px', cursor:'pointer',
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:6}}>
                  <h3 style={{fontFamily:'"Noto Serif JP", serif', fontSize:17, fontWeight:700, letterSpacing:'-0.005em', margin:0, lineHeight:1.3}}>{t.name}</h3>
                  <span style={{fontSize:11, color:'#8a7a58', fontFamily:'ui-monospace, monospace'}}>{t.count}</span>
                </div>
                <p style={{fontSize:12, color:'#6e5a3e', lineHeight:1.65, margin:0}}>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <aside>
          <h2 style={{fontSize:13, fontWeight:700, color:'#8a7a58', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 12px'}}>
            繰り返されるパターン
          </h2>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            {window.PATTERNS.map(p => (
              <div key={p.slug} style={{border:'1px solid #d9cfb8', borderRadius:8, padding:'11px 14px', background:'#fffdf7', cursor:'pointer', fontSize:13}}>
                <div style={{display:'flex', gap:8, alignItems:'center', marginBottom:3}}>
                  <span style={{
                    fontSize:9, fontFamily:'ui-monospace, monospace', padding:'1px 5px', borderRadius:3,
                    background:'#ede4d1', color:'#6e1f2a', fontWeight:700, letterSpacing:'0.04em',
                  }}>{p.kind}</span>
                  <span style={{fontSize:10, color:'#a8976f', fontFamily:'ui-monospace, monospace'}}>{p.count}例</span>
                </div>
                <div style={{fontWeight:500, color:'#1a1a1a'}}>{p.name}</div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function WarmCases({ onNav }) {
  const [view, setView] = React.useState('grid');
  const [theme, setTheme] = React.useState(null);
  const filtered = window.CASES.filter(c => !theme || c.themes.includes(theme));

  return (
    <div style={{maxWidth:1280, margin:'0 auto', padding:'32px 32px 0'}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:12, color:'#8a7a58', fontFamily:'ui-monospace, monospace', marginBottom:4}}>/cases</div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h1 style={{fontFamily:'"Noto Serif JP", serif', fontSize:32, fontWeight:800, letterSpacing:'-0.02em', margin:0}}>
            事例 <span style={{color:'#a8976f', fontWeight:500}}>{filtered.length}</span>
          </h1>
          <div style={{display:'flex', gap:4, padding:3, border:'1px solid #d9cfb8', borderRadius:8, background:'#fffdf7'}}>
            {['grid','table','timeline'].map(v => (
              <button key={v} onClick={()=>setView(v)} style={{
                border:'none', padding:'5px 10px', borderRadius:5, cursor:'pointer',
                fontSize:12, fontWeight:500, fontFamily:'inherit',
                background: view===v ? '#ede4d1' : 'transparent',
                color: view===v ? '#6e1f2a' : '#6e5a3e',
              }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'flex', gap:6, flexWrap:'wrap', padding:'12px 0', borderTop:'1px solid #d9cfb8', borderBottom:'1px solid #d9cfb8', marginBottom:20, fontSize:12}}>
        <button onClick={()=>setTheme(null)} style={{
          border:'1px solid '+(!theme?'#6e1f2a':'#d9cfb8'), background:!theme?'#6e1f2a':'#fffdf7', color:!theme?'#fffdf7':'#52463a',
          borderRadius:6, padding:'4px 10px', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:500,
        }}>All</button>
        {window.THEMES.map(t => (
          <button key={t.slug} onClick={()=>setTheme(theme===t.slug?null:t.slug)} style={{
            border:'1px solid '+(theme===t.slug?'#6e1f2a':'#d9cfb8'), background:theme===t.slug?'#6e1f2a':'#fffdf7', color:theme===t.slug?'#fffdf7':'#52463a',
            borderRadius:6, padding:'4px 10px', cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:500,
          }}>
            {t.name} <span style={{opacity:0.7, fontFamily:'ui-monospace, monospace'}}>{t.count}</span>
          </button>
        ))}
      </div>

      {view==='grid' && (
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12, marginBottom:60}}>
          {filtered.map(c => (
            <div key={c.slug} onClick={()=>onNav('/cases/'+c.slug)} style={{
              border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:20, cursor:'pointer',
            }}>
              <div style={{fontSize:11, color:'#8a7a58', fontFamily:'ui-monospace, monospace', marginBottom:10}}>
                {c.periodStart}–{c.periodEnd}
                <span style={{marginLeft:10, color:'#a8976f'}}>{c.region}</span>
              </div>
              <h3 style={{fontFamily:'"Noto Serif JP", serif', fontSize:18, fontWeight:700, letterSpacing:'-0.01em', margin:'0 0 8px', lineHeight:1.3}}>
                {c.title}
              </h3>
              <p style={{fontSize:13, color:'#52463a', lineHeight:1.65, margin:'0 0 14px'}}>{c.oneLiner}</p>
              <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                {c.themes.slice(0,2).map(th => {
                  const t = window.THEMES.find(x=>x.slug===th);
                  return t ? <span key={th} style={{fontSize:10, background:'#ede4d1', color:'#6e1f2a', padding:'2px 7px', borderRadius:4, fontWeight:500}}>{t.name}</span> : null;
                })}
                {c.tags.slice(0,2).map(t => (
                  <span key={t} style={{fontSize:10, background:'#f0e9d4', color:'#6e5a3e', padding:'2px 7px', borderRadius:4}}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {view==='table' && (
        <div style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', overflow:'hidden', marginBottom:60}}>
          <div style={{display:'grid', gridTemplateColumns:'60px 1fr 100px 100px 100px 100px', fontSize:11, color:'#8a7a58', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', padding:'10px 16px', borderBottom:'1px solid #d9cfb8', background:'#faf5e8'}}>
            <span>#</span><span>Title</span><span>Start</span><span>End</span><span>Region</span><span>転換点</span>
          </div>
          {filtered.map((c, i) => (
            <div key={c.slug} onClick={()=>onNav('/cases/'+c.slug)} style={{
              display:'grid', gridTemplateColumns:'60px 1fr 100px 100px 100px 100px',
              padding:'14px 16px', borderBottom: i<filtered.length-1?'1px solid #ede4d1':'none',
              cursor:'pointer', fontSize:13,
            }}>
              <span style={{fontFamily:'ui-monospace, monospace', color:'#a8976f'}}>{String(i+1).padStart(3,'0')}</span>
              <div>
                <div style={{fontWeight:600, fontFamily:'"Noto Serif JP", serif'}}>{c.title}</div>
                <div style={{fontSize:12, color:'#6e5a3e', marginTop:2}}>{c.oneLiner}</div>
              </div>
              <span style={{fontFamily:'ui-monospace, monospace'}}>{c.periodStart}</span>
              <span style={{fontFamily:'ui-monospace, monospace'}}>{c.periodEnd}</span>
              <span>{c.region}</span>
              <span>
                <span style={{fontFamily:'ui-monospace, monospace', background:'#ede4d1', color:'#6e1f2a', padding:'2px 6px', borderRadius:4, fontSize:11, fontWeight:600}}>
                  {c.turningPoints.length}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {view==='timeline' && (
        <div style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:32, marginBottom:60}}>
          <div style={{position:'relative', minHeight: filtered.length*44 + 40, paddingLeft:20}}>
            <div style={{position:'absolute', top:0, left:20, right:20, height:24, borderBottom:'1px solid #d9cfb8', display:'flex', justifyContent:'space-between', fontFamily:'ui-monospace, monospace', fontSize:10, color:'#a8976f', paddingBottom:4}}>
              {[1950,1970,1990,2010,2020].map(y => <span key={y}>{y}</span>)}
            </div>
            {filtered.map((c, i) => {
              const min=1950, max=2025, range = max-min;
              const left = ((c.periodStart-min)/range)*100;
              const width = ((c.periodEnd-c.periodStart)/range)*100;
              return (
                <div key={c.slug} onClick={()=>onNav('/cases/'+c.slug)} style={{
                  position:'absolute', top: 40 + i*36, height:28,
                  left: `${left}%`, width: `max(160px, ${width}%)`,
                  background:'#ede4d1', border:'1px solid #c8b892', borderRadius:6, padding:'4px 10px',
                  cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:12,
                }}>
                  <span style={{fontFamily:'"Noto Serif JP", serif', fontWeight:700, color:'#6e1f2a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.title}</span>
                  <span style={{fontFamily:'ui-monospace, monospace', color:'#6e1f2a', fontSize:10, marginLeft:'auto', whiteSpace:'nowrap'}}>{c.periodStart}–{c.periodEnd}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function WarmCaseDetail({ slug, onNav }) {
  const c = window.CASES.find(x => x.slug === slug) || window.CASES[0];
  const [activeTab, setActiveTab] = React.useState('overview');
  return (
    <div style={{maxWidth:1280, margin:'0 auto', padding:'24px 32px 0'}}>
      <nav style={{fontSize:12, color:'#8a7a58', marginBottom:16, fontFamily:'ui-monospace, monospace'}}>
        <a href="#" onClick={(e)=>{e.preventDefault();onNav('/cases');}} style={{color:'#8a7a58', textDecoration:'none'}}>cases</a>
        <span style={{margin:'0 6px', color:'#c8b892'}}>/</span>
        <span style={{color:'#1a1a1a'}}>{slug}</span>
      </nav>
      <div style={{display:'grid', gridTemplateColumns:'1fr 320px', gap:32}}>
        <div>
          <div style={{marginBottom:24}}>
            <div style={{display:'flex', gap:6, marginBottom:10}}>
              {c.themes.map(th => {
                const t = window.THEMES.find(x=>x.slug===th);
                return t ? <span key={th} style={{fontSize:11, color:'#6e1f2a', background:'#ede4d1', padding:'3px 10px', borderRadius:4, fontWeight:500}}>{t.name}</span> : null;
              })}
            </div>
            <h1 style={{fontFamily:'"Noto Serif JP", serif', fontSize:40, fontWeight:800, letterSpacing:'-0.025em', lineHeight:1.15, margin:'0 0 10px'}}>{c.title}</h1>
            <p style={{fontFamily:'"Noto Serif JP", serif', fontSize:18, color:'#52463a', fontStyle:'italic', lineHeight:1.55, margin:'0 0 16px'}}>——{c.subtitle}</p>
            <div style={{display:'flex', gap:20, fontSize:13, color:'#52463a', paddingBottom:20, borderBottom:'1px solid #d9cfb8'}}>
              <span><span style={{color:'#a8976f'}}>期間</span> <span style={{fontFamily:'ui-monospace, monospace', fontWeight:600, color:'#1a1a1a'}}>{c.periodStart}–{c.periodEnd}</span></span>
              <span><span style={{color:'#a8976f'}}>地域</span> {c.region}</span>
              <span><span style={{color:'#a8976f'}}>業界</span> {c.industry}</span>
              <span style={{marginLeft:'auto'}}><span style={{color:'#a8976f'}}>更新</span> <span style={{fontFamily:'ui-monospace, monospace'}}>2026-02-14</span></span>
            </div>
          </div>

          <div style={{display:'flex', gap:2, borderBottom:'1px solid #d9cfb8', marginBottom:24}}>
            {[
              {id:'overview', label:'概要'},
              {id:'timeline', label:'タイムライン', count: c.events.length},
              {id:'insights', label:'示唆', count: 3},
              {id:'sources', label:'出典', count: 4},
              {id:'related', label:'関連', count: 2},
            ].map(t => (
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                border:'none', background:'transparent', padding:'10px 14px', cursor:'pointer',
                fontFamily:'inherit', fontSize:13, fontWeight:500,
                color: activeTab===t.id ? '#6e1f2a' : '#8a7a58',
                borderBottom: activeTab===t.id ? '2px solid #6e1f2a' : '2px solid transparent',
                marginBottom:-1, display:'flex', gap:6, alignItems:'center',
              }}>
                {t.label}
                {t.count && <span style={{fontSize:10, color:'#a8976f', fontFamily:'ui-monospace, monospace', background:'#ede4d1', padding:'1px 5px', borderRadius:3}}>{t.count}</span>}
              </button>
            ))}
          </div>

          {activeTab==='overview' && (
            <div>
              <div style={{background:'#fffdf7', border:'1px solid #d9cfb8', borderRadius:10, padding:'18px 22px', marginBottom:24, borderLeft:'3px solid #6e1f2a'}}>
                <div style={{fontSize:11, color:'#6e1f2a', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6}}>Summary</div>
                <p style={{fontSize:15, lineHeight:1.85, margin:0, color:'#1a1a1a'}}>{c.oneLiner}</p>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, marginBottom:24}}>
                {[
                  {label:'転換点', value:c.turningPoints.length},
                  {label:'総イベント', value:c.events.length},
                  {label:'継続年数', value:(c.periodEnd-c.periodStart)+'年'},
                ].map(s => (
                  <div key={s.label} style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:'14px 16px'}}>
                    <div style={{fontSize:11, color:'#8a7a58', marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:26, fontWeight:800, letterSpacing:'-0.02em', fontFamily:'"Noto Serif JP", serif', color:'#6e1f2a'}}>{s.value}</div>
                  </div>
                ))}
              </div>
              <h3 style={{fontFamily:'"Noto Serif JP", serif', fontSize:18, fontWeight:700, letterSpacing:'-0.01em', margin:'0 0 12px'}}>本文</h3>
              <div style={{fontSize:15, lineHeight:1.9, color:'#1a1a1a'}}>
                <h4 style={{fontFamily:'"Noto Serif JP", serif', fontSize:14, fontWeight:700, margin:'0 0 8px', color:'#52463a'}}>一　「製品を持たない」という挑戦</h4>
                <p style={{margin:'0 0 16px'}}>1987年の創業時、半導体業界の常識は「設計と製造は垂直統合すべき」だった。モリス・チャンは、その逆を行った。</p>
                <h4 style={{fontFamily:'"Noto Serif JP", serif', fontSize:14, fontWeight:700, margin:'0 0 8px', color:'#52463a'}}>二　ファブレスの第一世代</h4>
                <p style={{margin:'0 0 16px'}}>1994年の上場で資本市場は「製造専業」を認証した。そこから得た資金が複利的に効いた。</p>
                <h4 style={{fontFamily:'"Noto Serif JP", serif', fontSize:14, fontWeight:700, margin:'0 0 8px', color:'#52463a'}}>三　逆転</h4>
                <p style={{margin:0}}>2019年の7nm量産は、半世紀続いたIntel主導の製造リーダーシップが恒久的に台湾へ移ったことを意味した。</p>
              </div>
            </div>
          )}

          {activeTab==='timeline' && (
            <div style={{background:'#fffdf7', border:'1px solid #d9cfb8', borderRadius:10, padding:24}}>
              <div style={{position:'relative', paddingLeft:24, borderLeft:'2px solid #ede4d1'}}>
                {c.events.map((ev, i) => (
                  <div key={i} style={{position:'relative', paddingBottom:20}}>
                    <div style={{position:'absolute', left:-30, top:4, width: ev.tp?12:8, height: ev.tp?12:8, background: ev.tp?'#6e1f2a':'#a8976f', borderRadius:99, border:'2px solid #fffdf7', boxShadow: ev.tp?'0 0 0 2px #6e1f2a':'0 0 0 1px #a8976f'}}/>
                    <div style={{display:'flex', gap:12, alignItems:'baseline', marginBottom:2}}>
                      <span style={{fontFamily:'"Noto Serif JP", serif', fontSize:18, fontWeight:800, color: ev.tp?'#6e1f2a':'#1a1a1a'}}>{ev.year}</span>
                      {ev.tp && <span style={{fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#6e1f2a', background:'#ede4d1', padding:'2px 7px', borderRadius:3}}>転換点</span>}
                    </div>
                    <div style={{fontSize:14, color:'#1a1a1a', lineHeight:1.6, fontWeight: ev.tp?600:500}}>{ev.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==='insights' && (
            <div style={{display:'flex', flexDirection:'column', gap:10}}>
              {[
                {kind:'メカニズム', text:'「競合しない」という戦略的自己制約が、むしろ顧客基盤の拡大を可能にする。'},
                {kind:'パターン', text:'垂直統合の優位が崩れるのは、製造投資の規模が一社で賄えなくなった時点。'},
                {kind:'予測レンズ', text:'特定工程への投資を一社に集中させると、地政学的リスクが産業そのものを制約する。'},
              ].map((l,i) => (
                <div key={i} style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:'16px 20px', display:'flex', gap:14}}>
                  <span style={{fontSize:10, fontFamily:'ui-monospace, monospace', letterSpacing:'0.05em', padding:'3px 8px', borderRadius:4, background:'#ede4d1', color:'#6e1f2a', fontWeight:700, height:'fit-content'}}>{l.kind}</span>
                  <p style={{margin:0, fontSize:14, lineHeight:1.75, color:'#1a1a1a'}}>{l.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab==='sources' && (
            <div style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:24}}>
              <ol style={{margin:0, paddingLeft:24, fontSize:13, lineHeight:1.9, color:'#1a1a1a'}}>
                <li style={{marginBottom:10}}>Miller, C. <i>Chip War</i>. Scribner, 2022.</li>
                <li style={{marginBottom:10}}>張忠謀『張忠謀自傳』天下文化, 2018.</li>
                <li style={{marginBottom:10}}>日経産業新聞「TSMC 7nm量産、Intelを逆転」2019.04.15</li>
                <li>Economist Intelligence Unit. <i>Semiconductor Supply Chain Report</i>, 2020.</li>
              </ol>
            </div>
          )}

          {activeTab==='related' && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
              {window.CASES.filter(x=>x.slug!==c.slug).slice(0,2).map(r => (
                <div key={r.slug} onClick={()=>onNav('/compare?a='+c.slug+'&b='+r.slug)} style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:18, cursor:'pointer'}}>
                  <div style={{fontSize:10, color:'#6e1f2a', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8}}>対比</div>
                  <h4 style={{fontFamily:'"Noto Serif JP", serif', fontSize:16, fontWeight:700, margin:'0 0 6px', lineHeight:1.3}}>{r.title}</h4>
                  <p style={{fontSize:12, color:'#52463a', lineHeight:1.65, margin:'0 0 10px'}}>同じく「垂直分解」が起きた事例。条件の違いを比較すると、成立要件が見える。</p>
                  <div style={{fontSize:12, color:'#6e1f2a', fontWeight:600}}>比較する →</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside>
          <div style={{position:'sticky', top:72}}>
            <div style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:16, marginBottom:16}}>
              <div style={{fontSize:11, color:'#8a7a58', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10}}>登場</div>
              {[
                {role:'主役', items:['TSMC', 'モリス・チャン']},
                {role:'競合', items:['Intel', 'Samsung']},
                {role:'顧客', items:['Apple', 'AMD', 'Nvidia']},
              ].map(g => (
                <div key={g.role} style={{marginBottom:12}}>
                  <div style={{fontSize:11, color:'#a8976f', marginBottom:4}}>{g.role}</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                    {g.items.map(n => <span key={n} style={{fontSize:12, border:'1px solid #d9cfb8', padding:'2px 8px', borderRadius:4, background:'#faf5e8'}}>{n}</span>)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:16, marginBottom:16}}>
              <div style={{fontSize:11, color:'#8a7a58', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10}}>タグ</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:4}}>
                {c.tags.map(t => <span key={t} style={{fontSize:11, background:'#ede4d1', color:'#6e5a3e', padding:'3px 8px', borderRadius:4, cursor:'pointer'}}>#{t}</span>)}
              </div>
            </div>
            <button onClick={()=>onNav('/compare?a='+c.slug)} style={{width:'100%', border:'1px solid #d9cfb8', background:'#fffdf7', color:'#1a1a1a', borderRadius:8, padding:'10px 12px', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span>比較に使う</span>
              <span style={{color:'#6e1f2a'}}>→</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function WarmThemes({ onNav }) {
  return (
    <div style={{maxWidth:1280, margin:'0 auto', padding:'32px 32px 0'}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:12, color:'#8a7a58', fontFamily:'ui-monospace, monospace', marginBottom:4}}>/themes</div>
        <h1 style={{fontFamily:'"Noto Serif JP", serif', fontSize:32, fontWeight:800, letterSpacing:'-0.02em', margin:0}}>テーマ <span style={{color:'#a8976f', fontWeight:500}}>{window.THEMES.length}</span></h1>
        <p style={{fontSize:14, color:'#52463a', margin:'6px 0 0'}}>横串の主題ごとに事例を束ねる。それぞれに成立条件と反例がある。</p>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:12}}>
        {window.THEMES.map(t => {
          const cases = window.casesInTheme(t.slug);
          return (
            <div key={t.slug} onClick={()=>onNav('/themes/'+t.slug)} style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:22, cursor:'pointer'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8}}>
                <h2 style={{fontFamily:'"Noto Serif JP", serif', fontSize:20, fontWeight:700, margin:0, letterSpacing:'-0.01em'}}>{t.name}</h2>
                <span style={{fontSize:12, color:'#8a7a58', fontFamily:'ui-monospace, monospace'}}>{t.count}</span>
              </div>
              <p style={{fontSize:13, color:'#52463a', lineHeight:1.75, margin:'0 0 14px'}}>{t.desc}</p>
              <div style={{paddingTop:12, borderTop:'1px solid #ede4d1'}}>
                {cases.slice(0,3).map(c => (
                  <div key={c.slug} style={{display:'flex', justifyContent:'space-between', fontSize:12, padding:'4px 0'}}>
                    <span style={{color:'#1a1a1a'}}>{c.title}</span>
                    <span style={{color:'#a8976f', fontFamily:'ui-monospace, monospace'}}>{c.periodStart}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WarmCompare({ onNav }) {
  const a = window.CASES[0], b = window.CASES[1];
  const axes = [
    { axis:'構造変化', a:'設計と製造の垂直分離', b:'小売と物流の情報統合' },
    { axis:'転換点', a:'1994年上場、1987年創業', b:'1982年POS全店、1987年共同配送' },
    { axis:'成立条件', a:'資本市場の信認、製造投資規模', b:'POSデータの独占、物流の自前化' },
    { axis:'敗者', a:'IDM陣営 (Intel等)', b:'米サウスランド (買収される)' },
    { axis:'現在形', a:'シリコンシールドと地政学', b:'ライフインフラ化、海外展開の基盤' },
  ];
  return (
    <div style={{maxWidth:1280, margin:'0 auto', padding:'32px 32px 0'}}>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:12, color:'#8a7a58', fontFamily:'ui-monospace, monospace', marginBottom:4}}>/compare</div>
        <h1 style={{fontFamily:'"Noto Serif JP", serif', fontSize:32, fontWeight:800, letterSpacing:'-0.02em', margin:0}}>比較</h1>
        <p style={{fontSize:14, color:'#52463a', margin:'6px 0 0'}}>2つの事例を並べて、条件と結論を対比する。</p>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24}}>
        {[a,b].map((c, i) => (
          <div key={c.slug} style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', padding:22}}>
            <div style={{fontSize:11, color:'#8a7a58', fontFamily:'ui-monospace, monospace', marginBottom:6}}>{i===0?'甲 · Case A':'乙 · Case B'} · {c.periodStart}–{c.periodEnd}</div>
            <h2 style={{fontFamily:'"Noto Serif JP", serif', fontSize:22, fontWeight:700, margin:'0 0 6px', lineHeight:1.3}}>{c.title}</h2>
            <p style={{fontFamily:'"Noto Serif JP", serif', fontSize:14, fontStyle:'italic', color:'#52463a', lineHeight:1.6, margin:0}}>——{c.subtitle}</p>
          </div>
        ))}
      </div>
      <div style={{border:'1px solid #d9cfb8', borderRadius:10, background:'#fffdf7', overflow:'hidden', marginBottom:24}}>
        <div style={{display:'grid', gridTemplateColumns:'140px 1fr 1fr', padding:'10px 16px', fontSize:11, color:'#8a7a58', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', background:'#faf5e8', borderBottom:'1px solid #d9cfb8'}}>
          <span>軸</span><span>甲</span><span>乙</span>
        </div>
        {axes.map((ax, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'140px 1fr 1fr', padding:'14px 16px', borderBottom: i<axes.length-1?'1px solid #ede4d1':'none', fontSize:13, lineHeight:1.75}}>
            <span style={{fontWeight:700, color:'#6e1f2a', fontFamily:'"Noto Serif JP", serif'}}>{ax.axis}</span>
            <span style={{color:'#1a1a1a'}}>{ax.a}</span>
            <span style={{color:'#1a1a1a'}}>{ax.b}</span>
          </div>
        ))}
      </div>
      <div style={{border:'1px solid #c8b892', background:'#ede4d1', borderRadius:10, padding:'20px 24px'}}>
        <div style={{fontSize:11, color:'#6e1f2a', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8}}>結び</div>
        <p style={{fontFamily:'"Noto Serif JP", serif', fontSize:16, lineHeight:1.9, margin:0, color:'#1a1a1a', fontStyle:'italic'}}>
          自分で全部作るか、作る場所を握るか──両者は逆方向の選択をしながら、同じ結論に至っている。すなわち<strong style={{fontStyle:'normal'}}>顧客の注文を受ける一歩手前の層</strong>を押さえた者が勝つ。
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { WarmShell, WarmHome, WarmCases, WarmCaseDetail, WarmThemes, WarmCompare });
