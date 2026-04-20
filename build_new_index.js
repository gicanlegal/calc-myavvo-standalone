const fs = require('fs');

const oldHTML = fs.readFileSync('index.html', 'utf-8');

// Extract JS
const scriptMatch = oldHTML.match(/<script>\s*var RD=\[\{d:'11\.12\.2025'[\s\S]*?<\/script>/);
const jsCode = scriptMatch ? scriptMatch[0] : '<script>console.error("JS NOT FOUND!");</script>';

// Also extract the maskDate script and modals
const modalMatch = oldHTML.match(/<!-- Modal eroare validare -->[\s\S]*?<\/div>\s*<\/div>/);
const modalCode = modalMatch ? modalMatch[0] : '';

const newHTML = `<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Calculator Juridic</title>
<meta name="description" content="Calculator juridic: dobândă legală, penalitate, taxa de stat. Conform legislației Republicii Moldova.">
<link rel="icon" href="/logo.png" type="image/png">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.6.0/jspdf.plugin.autotable.min.js"></script>
<style>
/* CSS Variables */
:root {
    --bg: #f0f9ff;
    --glass-bg: rgba(255, 255, 255, 0.6);
    --glass-border: rgba(255, 255, 255, 0.8);
    --glass-shadow: 0 8px 32px 0 rgba(14, 165, 233, 0.1);
    --text-main: #0f172a;
    --text-muted: #64748b;
    --accent: #0ea5e9;
    --accent-hover: #0284c7;
    --accent-gradient: linear-gradient(135deg, #38bdf8, #3b82f6);
    --radius: 24px;
    
    --surface: var(--glass-bg);
    --surface-2: rgba(255, 255, 255, 0.5);
    --border: var(--glass-border);
    --border-2: rgba(255, 255, 255, 0.5);
    --text-primary: var(--text-main);
    --text-secondary: var(--text-muted);
    --input-bg: rgba(255,255,255,0.5);
    --input-border: var(--glass-border);
    --result-bg: var(--accent-gradient);
    --shadow: var(--glass-shadow);
    --label: #0f172a;
    --accent-subtle: rgba(14, 165, 233, 0.1);
    --accent-border: rgba(14, 165, 233, 0.3);
    --primary: #0284c7;
}

[data-theme="dark"] {
    --bg: #020617;
    --glass-bg: rgba(15, 23, 42, 0.7);
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --accent: #0ea5e9;
    --accent-hover: #0284c7;
    --accent-gradient: linear-gradient(135deg, #38bdf8, #3b82f6);
    
    --surface: var(--glass-bg);
    --surface-2: rgba(0, 0, 0, 0.3);
    --border: var(--glass-border);
    --border-2: rgba(255, 255, 255, 0.05);
    --text-primary: var(--text-main);
    --text-secondary: var(--text-muted);
    --input-bg: rgba(0,0,0,0.2);
    --input-border: var(--glass-border);
    --result-bg: var(--accent-gradient);
    --shadow: var(--glass-shadow);
    --label: #f8fafc;
    --accent-subtle: rgba(14, 165, 233, 0.15);
    --accent-border: rgba(14, 165, 233, 0.3);
    --primary: #38bdf8;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Outfit', sans-serif;
    background-color: var(--bg);
    background-image: 
        radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.15) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
        radial-gradient(at 50% 50%, rgba(14, 165, 233, 0.15) 0px, transparent 50%);
    color: var(--text-main);
    padding: 1.5rem;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background 0.3s, color 0.3s;
}

[data-theme="dark"] body {
    background-image: 
        radial-gradient(at 0% 0%, rgba(56, 189, 248, 0.1) 0px, transparent 50%),
        radial-gradient(at 100% 100%, rgba(59, 130, 246, 0.1) 0px, transparent 50%);
}

.bento-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: auto 1fr;
    gap: 1.5rem;
    max-width: 1300px;
    width: 100%;
    /* min-height: 85vh; removing height restriction so it flows naturally */
}

.bento-card {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: var(--radius);
    padding: 1.5rem;
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
}

.bento-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}

/* Layout */
.header { grid-column: 1 / 4; grid-row: 1 / 2; flex-direction: row; justify-content: space-between; align-items: center; padding: 1.25rem 2rem;}
.tools { grid-column: 4 / 5; grid-row: 1 / 3; }
.main-inputs { grid-column: 1 / 3; grid-row: 2 / 3; max-height: 80vh; overflow-y: auto;}
.results { grid-column: 3 / 4; grid-row: 2 / 3; max-height: 80vh; overflow-y: auto;}

/* Custom Scrollbar for inner cards */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(14, 165, 233, 0.3); border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: rgba(14, 165, 233, 0.6); }

/* Typography */
h1 { font-size: 1.75rem; font-weight: 700; background: var(--accent-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin:0;}
h2 { font-size: 1.25rem; font-weight: 600; margin-bottom: 1.25rem; color: var(--text-main);}

/* Tabs in Tools */
.tab {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text-main);
    padding: 1rem;
    border-radius: 16px;
    margin-bottom: 1rem;
    cursor: pointer;
    transition: all 0.3s;
    text-align: center;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
}
.tab:hover { background: rgba(255,255,255,0.8); }
[data-theme="dark"] .tab:hover { background: rgba(255,255,255,0.1); }
.tab.active { background: var(--accent-gradient); border-color: transparent; color: white; box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);}

/* Form Elements */
.fg { margin-bottom: 1rem; }
.fg label { display: block; font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.4rem; font-weight: 500;}
.fg input, .fg select {
    width: 100%;
    padding: 0.8rem 1rem;
    background: var(--input-bg);
    border: 1px solid var(--input-border);
    border-radius: 12px;
    color: var(--text-main);
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.3s;
}
.fg input:focus, .fg select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);}
[data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
.fh { color: var(--text-muted); font-size: 0.75rem; margin-top: 4px; }

/* Existing classes converted to Bento */
.tc { display: none; }
.tc.active { display: block; }

.ct {font-size:1rem;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px;color:var(--text-main)}
.stp {background:var(--accent-gradient);color:white;min-width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700}

.card { margin-bottom: 1.5rem; } /* Replaces inner cards with just spacing */
.card .ct { margin-bottom: 1rem; }

/* Radios */
.rc {display:flex;flex-direction:row;gap:8px}
.ri {position:relative;flex:1}
.ri input[type=radio] {position:absolute;opacity:0;width:100%;height:100%;cursor:pointer;z-index:2}
.ri > label {display:block;padding:12px 8px;border-radius:12px;border:2px solid var(--border);background:var(--surface-2);text-align:center;cursor:pointer;transition:all 0.2s}
.ri input:checked + label {border-color:var(--accent);background:var(--accent-subtle)}
.ri .big {font-size:1.1rem;font-weight:700;color:var(--accent);display:block}
.ri .sm {font-size:0.75rem;color:var(--text-secondary);margin-top:2px}
.sc {display:flex;flex-direction:row;flex-wrap:wrap;gap:6px;}
.sc .ri {flex:1 1 45%;}

/* Item boxes */
.ib {padding:12px;background:var(--surface-2);border-radius:12px;margin-bottom:8px;border:1px solid var(--border)}
.ir {display:flex;flex-direction:row;gap:8px}
.ir > .fg {flex:1; margin-bottom: 0;}
.br {background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.2);color:#ef4444;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:0.8rem;margin-top:8px;font-family:inherit;font-weight:500;}
.ba {background:var(--surface-2);border:1px dashed var(--accent);color:var(--accent);padding:10px;border-radius:12px;cursor:pointer;font-size:0.9rem;width:100%;margin-top:6px;text-align:center;font-weight:600;font-family:inherit;}
.ba:hover {background:var(--accent-subtle);}

.bc {width:100%;padding:14px;border:none;border-radius:16px;background:var(--accent-gradient);color:#fff;font-size:1.1rem;font-weight:700;cursor:pointer;margin-top:1rem;font-family:inherit;box-shadow:0 10px 20px rgba(14,165,233,0.2);transition:transform 0.2s, box-shadow 0.2s}
.bc:hover {transform:translateY(-2px);box-shadow:0 15px 25px rgba(14,165,233,0.3);}
.bs {background:transparent!important;color:var(--accent)!important;border:2px solid var(--accent)!important;font-weight:600;box-shadow:none;}
.bs:hover {background:var(--accent-subtle)!important;box-shadow:none;transform:translateY(-2px);}

.rb2 {background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:1.5rem;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.rt2 {font-size:0.9rem;color:var(--text-secondary)} .rt2 strong{color:var(--text-main)}
.bf {padding:6px 12px;border-radius:8px;border:1px solid var(--accent);background:transparent;color:var(--accent);font-size:0.8rem;font-weight:600;cursor:pointer;font-family:inherit;}
.bf:hover {background:var(--accent-subtle);}

.rs2 {font-size:0.8rem;width:100%;margin-top:4px;padding:6px 10px;border-radius:6px;display:none;font-weight:500}
.rs2.show {display:block} .rs2.ok {background:rgba(16,185,129,.15);color:#10b981} .rs2.er {background:rgba(239,68,68,.15);color:#ef4444}
.sb {padding:10px 14px;border-radius:8px;margin-bottom:14px;font-size:0.9rem;display:none;font-weight:500}
.sb.show {display:block} .sb.er {background:rgba(239,68,68,.15);color:#ef4444}

/* Results Area */
.rse {display:none} .rse.show {display:block; animation: fadeIn 0.3s;}
@keyframes fadeIn { from {opacity: 0; transform: translateY(10px);} to {opacity: 1; transform: translateY(0);} }

/* Inside results, we want a special card for the main total */
.rca {background:var(--accent-gradient);color:white;padding:1.5rem;border-radius:20px;text-align:center;margin-bottom:1.5rem;box-shadow:0 10px 30px rgba(14,165,233,0.3);}
.rl {font-size:0.9rem;opacity:0.9;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;font-weight:600;}
.rv {font-size:2.5rem;font-weight:700;line-height:1.2;}
.rsu {font-size:0.85rem;opacity:0.8;margin-top:4px}
.rsum {display:grid;grid-template-columns:repeat(2, 1fr);gap:10px;margin-top:16px;background:rgba(0,0,0,0.15);padding:1rem;border-radius:16px;}
.si {text-align:left;}
.si .sl {font-size:0.75rem;opacity:0.8;}
.si .sv {font-size:1rem;font-weight:600;margin-top:2px;}

/* Tables */
.tw {overflow-x:auto;}
.tbl {width:100%;min-width:400px;border-collapse:collapse;font-size:0.8rem;}
.tbl th, .tbl td {padding:8px 6px;text-align:right;border-bottom:1px solid var(--border)}
.tbl th {background:var(--surface-2);color:var(--text-secondary);text-align:center;font-weight:600;font-size:0.75rem;}
.tbl th:first-child, .tbl td:first-child {text-align:left}
.tbl tr.sr td {color:#d97706}
.tbl tr.pr td {color:#059669}
.tbl tr.xtr {background:var(--surface-2);font-weight:700}
.tbl tr.xtr td {color:var(--text-main);border-top:2px solid var(--border)}
.tbl tr.lr td {color:#ef4444}

/* Modals */
.err-overlay {display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(15,23,42,.6);backdrop-filter:blur(4px);z-index:1100;align-items:center;justify-content:center;animation:errFIn .2s}
@keyframes errFIn{from{opacity:0}to{opacity:1}}
@keyframes errSIn{from{transform:translateY(20px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
.err-box {background:var(--surface);border-radius:24px;padding:32px;width:90%;max-width:400px;border:1px solid var(--glass-border);text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);animation:errSIn .25s}
.err-icon {width:64px;height:64px;background:rgba(239,68,68,.15);color:#ef4444;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:32px}
.err-msg {font-size:1rem;font-weight:500;color:var(--text-main);margin-bottom:24px;line-height:1.6}
.err-ok {padding:12px 40px;border-radius:12px;border:none;background:#ef4444;color:#fff;font-size:1rem;font-weight:600;cursor:pointer;transition:transform .1s;font-family:inherit;}
.err-ok:hover {transform:translateY(-2px);box-shadow:0 10px 15px -3px rgba(239,68,68,0.3);}

/* Currency Wrap */
.cur-wrap{position:relative;width:100%}
.cur-btn{width:100%;padding:12px 16px;border-radius:12px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--text-main);cursor:pointer;display:flex;align-items:center;justify-content:space-between;text-align:left;font-family:inherit;transition:all .2s}
.cur-btn:hover{border-color:var(--accent)}
.cur-sel-code{font-size:1.1rem;font-weight:700;color:var(--accent);display:block;line-height:1.2}
.cur-sel-nm{font-size:0.8rem;color:var(--text-secondary);display:block;margin-top:2px}
.cur-arr{font-size:12px;color:var(--text-muted);transition:transform .2s;}
.cur-arr.open{transform:rotate(180deg)}
.cur-dd{position:absolute;top:calc(100% + 4px);left:0;right:0;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);z-index:200;max-height:260px;overflow-y:auto;backdrop-filter:blur(20px);}
.cur-opt{display:flex;align-items:center;gap:10px;padding:10px 16px;cursor:pointer;border-bottom:1px solid var(--border)}
.cur-opt:hover{background:var(--surface-2)}
.cur-opt.sel{background:var(--accent-subtle)}
.cur-opt-code{font-size:0.9rem;font-weight:700;color:var(--accent);min-width:38px}
.cur-opt-nm{font-size:0.8rem;color:var(--text-secondary)}

/* Date Clear UX */
.date-wrap{position:relative;display:inline-block;width:100%}
.date-clear{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:var(--surface-2);border:1px solid var(--border);color:var(--text-muted);cursor:pointer;font-size:12px;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;}
.date-wrap:hover .date-clear, .date-wrap input:focus + .date-clear {opacity:1;}
.date-clear:hover{color:var(--text-main);background:var(--border);}

/* Zile calculator specifics */
.tc2 {display:flex;flex-direction:row;gap:12px}
.co {background:var(--surface-2);border:1px solid var(--border);border-radius:12px;padding:16px;flex:1}
.cot {font-size:1rem;font-weight:600;color:var(--text-main);margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:8px;}
.rg {display:flex;flex-direction:column;gap:6px}
.ro {display:flex;align-items:center;gap:8px;cursor:pointer}
.ro input {width:16px;height:16px;accent-color:var(--accent)}
.ro span {font-size:0.9rem;color:var(--text-main)}
.mb {display:flex;gap:8px;margin-bottom:16px}
.mbt {flex:1;padding:12px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-secondary);font-size:0.9rem;cursor:pointer;text-align:center;font-weight:500}
.mbt.active {background:var(--accent-subtle);border-color:var(--accent);color:var(--accent)}
.cg {display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
.co2 {display:flex;align-items:center;gap:6px;background:var(--surface-2);padding:8px 12px;border-radius:8px}
.co2 input {width:16px;height:16px;accent-color:var(--accent)}
.co2 span {font-size:0.85rem;}

.rbx {background:var(--accent-gradient);border-radius:20px;padding:1.5rem;margin-top:0;text-align:center;color:white;box-shadow:0 10px 30px rgba(14,165,233,0.3);}
.rbx .mnn {font-size:2.5rem;font-weight:700;}
.rbx .st2 {font-size:1rem;opacity:0.9;}
.rbx .det {display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px;background:rgba(0,0,0,0.15);padding:1rem;border-radius:16px;}
.rbx .di {text-align:center;}
.rbx .di .dn {font-size:1.2rem;font-weight:700;}
.rbx .di .dt {font-size:0.75rem;opacity:0.8;margin-top:2px}
.exb {background:var(--surface-2);border:1px solid var(--border);border-radius:16px;padding:16px;margin-top:16px;font-size:0.85rem;line-height:1.6;color:var(--text-secondary)}
.exb strong {color:var(--text-main)}
.lb {background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:12px;margin-bottom:16px;font-size:0.85rem;color:#d97706;font-weight:500;}

/* Responsive */
@media (max-width: 1000px) {
    .bento-container {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto auto;
    }
    .header { grid-column: 1 / 2; grid-row: 1 / 2; }
    .tools { grid-column: 1 / 2; grid-row: 2 / 3; display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px;}
    .tools h2 { display: none; }
    .tab { flex: 0 0 auto; margin-bottom: 0; padding: 0.8rem 1.2rem; white-space: nowrap;}
    .main-inputs { grid-column: 1 / 2; grid-row: 3 / 4; max-height: none;}
    .results { grid-column: 1 / 2; grid-row: 4 / 5; max-height: none;}
    .tc2 { flex-direction: column; }
    .rsum { grid-template-columns: repeat(2, 1fr); }
    .rbx .det { grid-template-columns: repeat(2, 1fr); }
}

/* Footer overrides */
footer { display: none; } /* Simplified for Bento layout */

</style>
</head>
<body>

<div class="bento-container">
    <div class="bento-card header">
        <div>
            <h1>CalcJuridic.</h1>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">myAVVO &mdash; Hub Juridic Moldova</div>
        </div>
        <div style="display:flex; gap:12px; align-items:center;">
            <button id="themeToggle" onclick="toggleTheme()" style="width:40px;height:40px;border-radius:12px;background:var(--surface-2);border:1px solid var(--border);color:var(--text-main);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;"><span id="themeIcon">☾</span></button>
            <div style="background: var(--surface-2); border: 1px solid var(--border); padding: 0.6rem 1rem; border-radius: 12px; font-size: 0.85rem; font-weight: 500; color: var(--text-main);">
                BNM: <span id="rc">0</span> rate
            </div>
        </div>
    </div>

    <div class="bento-card tools">
        <h2>Module</h2>
        <div class="tab active" id="btn-dobanda" onclick="ST('dobanda')">Dobândă Legală</div>
        <div class="tab" id="btn-pen" onclick="ST('pen')">Penalitate</div>
        <div class="tab" id="btn-taxa" onclick="ST('taxa')">Taxă de Stat</div>
        <div class="tab" id="btn-zile" onclick="ST('zile')">Calculator Zile</div>
    </div>

    <div class="bento-card main-inputs">
        <h2>Configurează Calculul</h2>
        
        <!-- DOBANDA INPUTS -->
        <div class="tc active" id="tab-dobanda">
            <div class="rb2"><div class="rt2"><strong>BNM:</strong> <span id="rf">-</span> - <span id="rto">-</span></div><button class="bf" onclick="AR()">Actualizează manual</button><div class="rs2" id="rS"></div></div>
            <div class="sb" id="sB"></div>
            
            <div id="dI">
                <div class="card"><div class="ct"><span class="stp">1</span><span>Valuta calculului</span></div><div class="cur-wrap" id="curWrap-dob"><button type="button" class="cur-btn" onclick="toggleCurDD('dob')"><div><span class="cur-sel-code" id="curCode-dob">MDL</span><span class="cur-sel-nm" id="curNm-dob">Leu moldovenesc</span></div><span class="cur-arr" id="curArr-dob">▾</span></button><div class="cur-dd" id="curDD-dob" style="display:none"></div></div></div>
                <div class="card"><div class="ct"><span class="stp">2</span><span>Procent (art.874 CC)</span></div><div class="rc"><div class="ri"><input type="radio" name="pY" id="p9" value="9" checked><label for="p9"><span class="big">+9%</span><span class="sm">Non-Consumatori</span></label></div><div class="ri"><input type="radio" name="pY" id="p5" value="5"><label for="p5"><span class="big">+5%</span><span class="sm">Consumatori</span></label></div></div></div>
                <div class="card"><div class="ct"><span class="stp">3</span>Sume scadente</div><div id="fL"></div><button class="ba" onclick="aF()">+ Adaugă Sumă Scadentă</button></div>
                <div class="card"><div class="ct"><span class="stp">4</span>Plăți</div><div id="pL"></div><button class="ba" onclick="aP()">+ Adaugă Plată</button></div>
                <div class="card"><div class="ct"><span class="stp">5</span>Data calcul</div><div class="fg"><label>Până la:</label><input type="text" id="dC" class="date-input" placeholder="zz/ll/aaaa" inputmode="numeric" maxlength="10" aria-label="Data calcul dobândă"></div></div>
                <div class="card"><div class="ct"><span class="stp">6</span>Opțiuni calcul</div>
                    <div style="margin-bottom:12px"><div style="font-size:0.85rem;color:var(--text-main);font-weight:500;margin-bottom:6px">Ziua scadenței:</div><div class="rc"><div class="ri"><input type="radio" name="incS" id="incSN" value="0" checked><label for="incSN"><span class="big">Fără</span><span class="sm">Din ziua următoare</span></label></div><div class="ri"><input type="radio" name="incS" id="incSY" value="1"><label for="incSY"><span class="big">Include</span><span class="sm">Din ziua scadenței</span></label></div></div></div>
                    <div><div style="font-size:0.85rem;color:var(--text-main);font-weight:500;margin-bottom:6px">Mod afișare rezultat:</div><div class="rc"><div class="ri"><input type="radio" name="modD" id="modDG" value="0" checked><label for="modDG"><span class="big">Grupat</span><span class="sm">Pe perioade</span></label></div><div class="ri"><input type="radio" name="modD" id="modDZ" value="1"><label for="modDZ"><span class="big">Detaliat</span><span class="sm">Zi cu zi</span></label></div></div></div>
                </div>
                <button class="bc" onclick="cD()">Calculează Dobânda</button>
            </div>
        </div>

        <!-- PENALITATE INPUTS -->
        <div class="tc" id="tab-pen">
            <div class="sb" id="pSB"></div>
            <div id="pI">
                <div class="card"><div class="ct"><span class="stp">1</span><span>Valuta calculului</span></div><div class="cur-wrap" id="curWrap-pen"><button type="button" class="cur-btn" onclick="toggleCurDD('pen')"><div><span class="cur-sel-code" id="curCode-pen">MDL</span><span class="cur-sel-nm" id="curNm-pen">Leu moldovenesc</span></div><span class="cur-arr" id="curArr-pen">▾</span></button><div class="cur-dd" id="curDD-pen" style="display:none"></div></div></div>
                <div class="card"><div class="ct"><span class="stp">2</span>Procent penalitate</div><div class="fg"><label>% per zi</label><input type="number" id="pPr" placeholder="0.1" step="0.001" min="0.001"><div class="fh">Ex: 0.1% pe zi</div></div></div>
                <div class="card"><div class="ct"><span class="stp">3</span>Limita perioadei</div><div class="sc"><div class="ri"><input type="radio" name="pLim" id="lN" value="0" checked><label for="lN"><span class="big">Fără</span><span class="sm">Fără limită</span></label></div><div class="ri"><input type="radio" name="pLim" id="l180" value="180"><label for="l180"><span class="big">180 zile</span><span class="sm">Max 180</span></label></div><div class="ri"><input type="radio" name="pLim" id="l3" value="1095"><label for="l3"><span class="big">3 ani</span><span class="sm">Max 1095</span></label></div></div></div>
                <div class="card"><div class="ct"><span class="stp">4</span>Sume scadente</div><div id="pfL"></div><button class="ba" onclick="aPF()">+ Adaugă Sumă Scadentă</button></div>
                <div class="card"><div class="ct"><span class="stp">5</span>Plăți</div><div id="ppL"></div><button class="ba" onclick="aPP()">+ Adaugă Plată</button></div>
                <div class="card"><div class="ct"><span class="stp">6</span>Data calcul</div><div class="fg"><label>Până la:</label><input type="text" id="pDC" class="date-input" placeholder="zz/ll/aaaa" inputmode="numeric" maxlength="10" aria-label="Data calcul penalitate"></div></div>
                <div class="card"><div class="ct"><span class="stp">7</span>Opțiuni calcul</div>
                    <div style="margin-bottom:12px"><div style="font-size:0.85rem;color:var(--text-main);font-weight:500;margin-bottom:6px">Ziua scadenței:</div><div class="rc"><div class="ri"><input type="radio" name="incSP" id="incSPN" value="0" checked><label for="incSPN"><span class="big">Fără</span><span class="sm">Din ziua următoare</span></label></div><div class="ri"><input type="radio" name="incSP" id="incSPY" value="1"><label for="incSPY"><span class="big">Include</span><span class="sm">Din ziua scadenței</span></label></div></div></div>
                    <div><div style="font-size:0.85rem;color:var(--text-main);font-weight:500;margin-bottom:6px">Mod afișare rezultat:</div><div class="rc"><div class="ri"><input type="radio" name="modP" id="modPG" value="0" checked><label for="modPG"><span class="big">Grupat</span><span class="sm">Pe perioade</span></label></div><div class="ri"><input type="radio" name="modP" id="modPZ" value="1"><label for="modPZ"><span class="big">Detaliat</span><span class="sm">Zi cu zi</span></label></div></div></div>
                </div>
                <button class="bc" onclick="cP()">Calculează Penalitatea</button>
            </div>
        </div>

        <!-- TAXA INPUTS -->
        <div class="tc" id="tab-taxa">
            <div class="card"><div class="ct"><span class="stp">1</span>Tip persoană</div><div class="rc"><div class="ri"><input type="radio" name="tP" id="tF" value="f" checked><label for="tF"><span class="big">Fizică</span></label></div><div class="ri"><input type="radio" name="tP" id="tJ" value="j"><label for="tJ"><span class="big">Juridică</span></label></div></div></div>
            <div class="card"><div class="ct"><span class="stp">2</span>Instanță</div><div class="sc"><div class="ri"><input type="radio" name="tI" id="iFo" value="1" checked><label for="iFo"><span class="big">Fond</span><span class="sm">100%</span></label></div><div class="ri"><input type="radio" name="tI" id="iAp" value="0.85"><label for="iAp"><span class="big">Apel</span><span class="sm">85%</span></label></div><div class="ri"><input type="radio" name="tI" id="iRe" value="0.70"><label for="iRe"><span class="big">Recurs</span><span class="sm">70%</span></label></div><div class="ri"><input type="radio" name="tI" id="iRv" value="0.55"><label for="iRv"><span class="big">Revizuire</span><span class="sm">55%</span></label></div></div></div>
            <div class="card"><div class="ct"><span class="stp">3</span>Tip acțiune</div><div class="rc"><div class="ri"><input type="radio" name="tA" id="aPa" value="p" checked onchange="uTU()"><label for="aPa"><span class="big">Patrimonială</span></label></div><div class="ri"><input type="radio" name="tA" id="aNe" value="n" onchange="uTU()"><label for="aNe"><span class="big">Nepatrimonială</span></label></div></div></div>
            <div class="card" id="cS"><div class="ct"><span class="stp">4</span>Valoare</div><div class="fg"><label>Suma MDL:</label><input type="number" id="tS" placeholder="100000" step="0.01"></div></div>
            <div class="card" id="cN" style="display:none"><div class="ct"><span class="stp">4</span>Tip cerere</div><div class="fg"><select id="tN">
            <option value="250">Cereri cu caracter nepatrimonial - 250 lei</option>
            <option value="500">Desfacerea căsătoriei - 500 lei</option>
            <option value="200">Stabilirea domiciliului copilului minor - 200 lei</option>
            <option value="250">Apărarea onoarei și demnității - 250 lei</option>
            <option value="250">Contestarea actelor executorului judecătoresc - 250 lei</option>
            <option value="250">Suspendarea executării - 250 lei</option>
            <option value="1000">Intentarea procesului de insolvabilitate - 1000 lei</option>
            <option value="250">Cauze cu procedură specială - 250 lei</option>
            <option value="500">Confirmarea tranzacției extrajudiciare - 500 lei</option>
            <option value="250">Recunoaștere/executare/desființare hotărâre arbitrală - 250 lei</option>
            </select></div></div>
            <button class="bc" onclick="cT()">Calculează Taxă</button>
        </div>

        <!-- ZILE INPUTS -->
        <div class="tc" id="tab-zile">
            <div class="card"><div class="ct"><span class="stp">Z</span>Calculator Zile</div>
            <div class="mb"><div class="mbt active" id="mDD" onclick="sM('dd')">Data-Data</div><div class="mbt" id="mDZ" onclick="sM('dz')">Data+Zile</div></div>
            <div class="tc2">
                <div class="co"><div class="cot">Data început</div><div class="rg"><label class="ro"><input type="radio" name="sT" value="d" checked><span>Selectează:</span></label></div><div class="fg" style="margin-top:6px"><input type="text" id="zS" class="date-input" placeholder="zz/ll/aaaa" inputmode="numeric" maxlength="10" aria-label="Data început"></div><div class="rg" style="margin-top:6px"><label class="ro"><input type="radio" name="sT" value="a"><span>Azi (<span id="aS">-</span>)</span></label></div></div>
                <div class="co"><div class="cot" id="eT">Data sfârșit</div><div id="eDD"><div class="rg"><label class="ro"><input type="radio" name="eT2" value="d" checked><span>Selectează:</span></label></div><div class="fg" style="margin-top:6px"><input type="text" id="zE" class="date-input" placeholder="zz/ll/aaaa" inputmode="numeric" maxlength="10" aria-label="Data sfârșit"></div><div class="rg" style="margin-top:6px"><label class="ro"><input type="radio" name="eT2" value="a"><span>Azi (<span id="aE">-</span>)</span></label></div></div><div id="eZD" style="display:none"><div class="fg"><label>Nr. ani:</label><input type="number" id="zAni" placeholder="0" min="0"></div><div class="fg" style="margin-top:6px"><label>Nr. luni:</label><input type="number" id="zLuni" placeholder="0" min="0"></div><div class="fg" style="margin-top:6px"><label>Nr. zile:</label><input type="number" id="zN" placeholder="0" min="0"></div></div></div>
            </div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border)"><div style="font-size:0.85rem;color:var(--text-main);font-weight:500;margin-bottom:8px">Opțiuni:</div><div class="cg"><label class="co2"><input type="checkbox" id="iP"><span>Include prima zi</span></label><label class="co2"><input type="checkbox" id="iU" checked><span>Include ultima zi</span></label></div></div>
            <button class="bc" style="margin-top:1.5rem" onclick="cZ()">Calculează</button>
            </div>
        </div>

    </div>

    <div class="bento-card results">
        <h2>Rezultate</h2>
        <div style="color:var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;" id="rez-empty-msg">Selectați un modul și efectuați un calcul.</div>
        
        <!-- DOBANDA REZULTATE -->
        <div class="rse" id="dR">
            <div class="rca"><div class="rl">Dobânda legală</div><div class="rv" id="dT">0</div><div class="rsu" id="dP"></div><div class="rsum"><div class="si"><div class="sl">Sume</div><div class="sv" id="d1">-</div></div><div class="si"><div class="sl">Achitat</div><div class="sv" id="d2">-</div></div><div class="si"><div class="sl">Zile</div><div class="sv" id="d3">-</div></div><div class="si"><div class="sl">%</div><div class="sv" id="d4">-</div></div></div></div>
            <div class="tw"><table class="tbl"><thead><tr><th>Perioadă</th><th>Zile</th><th>Suma</th><th>BNM</th><th>Tot%</th><th>Dob</th><th>Cum</th><th>Obs</th></tr></thead><tbody id="dTB"></tbody></table></div>
            <div style="display:flex;gap:10px;margin-top:1rem"><button class="bc bs" style="margin-top:0;flex:1" onclick="document.getElementById('dR').classList.remove('show');document.getElementById('rez-empty-msg').style.display='block';">Ascunde</button><button class="bc" style="margin-top:0;flex:1" onclick="eDP()">Descarcă PDF</button></div>
        </div>

        <!-- PENALITATE REZULTATE -->
        <div class="rse" id="pR">
            <div class="rca"><div class="rl">Penalitate totală</div><div class="rv" id="pT">0</div><div class="rsu" id="pPe"></div><div class="rsum"><div class="si"><div class="sl">Sume</div><div class="sv" id="p1">-</div></div><div class="si"><div class="sl">Achitat</div><div class="sv" id="p2">-</div></div><div class="si"><div class="sl">Zile</div><div class="sv" id="p3">-</div></div><div class="si"><div class="sl">%/zi</div><div class="sv" id="p4">-</div></div></div></div>
            <div class="lb" id="pLI" style="display:none"></div>
            <div class="tw"><table class="tbl"><thead><tr><th>Perioadă</th><th>Zile</th><th>Suma</th><th>%/zi</th><th>Penal.</th><th>Cum</th><th>Obs</th></tr></thead><tbody id="pTB"></tbody></table></div>
            <div style="display:flex;gap:10px;margin-top:1rem"><button class="bc bs" style="margin-top:0;flex:1" onclick="document.getElementById('pR').classList.remove('show');document.getElementById('rez-empty-msg').style.display='block';">Ascunde</button><button class="bc" style="margin-top:0;flex:1" onclick="ePP2()">Descarcă PDF</button></div>
        </div>

        <!-- TAXA REZULTATE -->
        <div class="rse" id="tR">
            <div class="rbx"><div class="rl" style="margin-bottom:8px">Taxă de stat</div><div class="mnn" id="tTo">0</div><div class="st2" id="tIn" style="margin-top:8px"></div></div>
            <div class="exb" id="tEx"></div>
            <div style="display:flex;gap:10px;margin-top:1rem"><button class="bc bs" style="margin-top:0;flex:1" onclick="document.getElementById('tR').classList.remove('show');document.getElementById('rez-empty-msg').style.display='block';">Ascunde</button><button class="bc" style="margin-top:0;flex:1" onclick="eTaxaPDF()">Descarcă PDF</button></div>
        </div>

        <!-- ZILE REZULTATE -->
        <div class="rse" id="zR">
            <div class="rbx"><div class="mnn" id="zTo">0</div><div class="st2" id="zLu" style="margin-top:4px">0 lucrătoare</div><div class="rsu" id="zPe" style="margin-top:4px; opacity:0.8"></div><div class="det"><div class="di"><div class="dn" id="zA">0</div><div class="dt">Ani</div></div><div class="di"><div class="dn" id="zL">0</div><div class="dt">Luni</div></div><div class="di"><div class="dn" id="zSa">0</div><div class="dt">Săpt</div></div><div class="di"><div class="dn" id="zRe">0</div><div class="dt">Zile</div></div></div><div id="dRz" style="margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.2);font-size:0.9rem;font-weight:600"></div></div>
            <div style="display:flex;gap:10px;margin-top:1rem"><button class="bc bs" style="margin-top:0;flex:1" onclick="document.getElementById('zR').classList.remove('show');document.getElementById('rez-empty-msg').style.display='block';">Ascunde</button><button class="bc" style="margin-top:0;flex:1" onclick="eZilePDF()">Descarcă PDF</button></div>
        </div>
    </div>
</div>

${modalCode}

<!-- Modyfing JS specifically for the new UI behavior -->
${jsCode.replace(/document\.getElementById\('dI'\)\.style\.display\s*=\s*'none';/g, '')
        .replace(/document\.getElementById\('pI'\)\.style\.display\s*=\s*'none';/g, '')
        .replace(/document\.getElementById\('dI'\)\.style\.display\s*=\s*'block'/g, '')
        .replace(/document\.getElementById\('pI'\)\.style\.display\s*=\s*'block'/g, '')
        // Modify tab buttons
        .replace(/var tb=document\.getElementsByClassName\('tab'\);/g, "var tb=document.querySelectorAll('.tools .tab');")
        .replace(/document\.getElementById\('btn-'\+t\)\.classList\.add\('active'\);/g, 
        "document.getElementById('btn-'+t).classList.add('active'); document.querySelectorAll('.rse').forEach(function(r){r.classList.remove('show');}); document.getElementById('rez-empty-msg').style.display='block';")
        // Hide empty message when results show
        .replace(/document\.getElementById\('dR'\)\.style\.display\s*=\s*'block';/g, "document.getElementById('dR').classList.add('show'); document.getElementById('rez-empty-msg').style.display='none';")
        .replace(/document\.getElementById\('pR'\)\.style\.display\s*=\s*'block';/g, "document.getElementById('pR').classList.add('show'); document.getElementById('rez-empty-msg').style.display='none';")
        .replace(/document\.getElementById\('tR'\)\.style\.display\s*=\s*'block';/g, "document.getElementById('tR').classList.add('show'); document.getElementById('rez-empty-msg').style.display='none';")
        .replace(/document\.getElementById\('zR'\)\.style\.display\s*=\s*'block';/g, "document.getElementById('zR').classList.add('show'); document.getElementById('rez-empty-msg').style.display='none';")
        // Fix taxa reset
        .replace(/document\.getElementById\('tR'\)\.style\.display\s*=\s*'none';/g, "document.getElementById('tR').classList.remove('show'); document.getElementById('rez-empty-msg').style.display='block';")
        // Fix zile reset
        .replace(/document\.getElementById\('zR'\)\.style\.display\s*=\s*'none';/g, "document.getElementById('zR').classList.remove('show'); document.getElementById('rez-empty-msg').style.display='block';")
        .replace(/function ST\(t\)\{/g, "function ST(t){ document.querySelectorAll('.rse').forEach(function(r){r.classList.remove('show');}); document.getElementById('rez-empty-msg').style.display='block'; ")
}

<script>
// Prevent multiple listeners if there were any issues
document.querySelectorAll('.date-input').forEach(i => {
    let w = document.createElement('div');
    w.className = 'date-wrap';
    i.parentNode.insertBefore(w, i);
    w.appendChild(i);
    let c = document.createElement('div');
    c.className = 'date-clear';
    c.innerHTML = '✕';
    c.onclick = function() { i.value = ''; };
    w.appendChild(c);
});
</script>
</body>
</html>`;

fs.writeFileSync('bento-mockups/new_index.html', newHTML);
console.log('Created new_index.html');
