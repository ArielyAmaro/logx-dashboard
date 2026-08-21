import pandas as pd, json, sys, os, warnings
warnings.filterwarnings("ignore")

CSV      = "Relatorio_IAN.csv"
TEMPLATE = "dash_v3_template.html"
JS       = "js_final.js"
OUT      = "index.html"

if not os.path.exists(CSV):
    print(f"AVISO: {CSV} nao encontrado.")
    sys.exit(0)

print(f"Lendo {CSV}...")
df = None
for enc in ['ISO-8859-1', 'utf-8', 'cp1252']:
    try:
        tmp = pd.read_csv(CSV, encoding=enc, sep=';')
        if len(tmp.columns) > 5:
            df = tmp
            print(f"  Encoding: {enc} | {len(df)} registros")
            break
    except:
        continue

if df is None:
    print("ERRO: nao foi possivel ler o CSV.")
    sys.exit(1)

df['_dt']  = pd.to_datetime(df['Data abertura processo'], dayfirst=True, errors='coerce')
df['_etd'] = pd.to_datetime(df['ETD/ATD'], dayfirst=True, errors='coerce')
df['_eta'] = pd.to_datetime(df['ETA/ATA'], dayfirst=True, errors='coerce')
df['ANO']  = df['_dt'].dt.year
df['MES']  = df['_dt'].dt.month
df['Total TEUS'] = pd.to_numeric(df['Total TEUS'], errors='coerce').fillna(0)

def s(v):
    r = str(v).strip()
    return '' if r in ['nan','None','NaT',''] else r

def d(v):
    try: return v.strftime('%d/%m/%Y') if pd.notna(v) else ''
    except: return ''

records = []
for _, r in df.iterrows():
    records.append({
        "proc":       s(r["Nº processo house"]),
        "booking":    s(r["Nº. Booking"]),
        "abertura":   d(r["_dt"]),
        "etd":        d(r["_etd"]),
        "eta":        d(r["_eta"]),
        "origem":     s(r["Origem"]),
        "destino":    s(r["Destino"]),
        "cliente":    s(r["Cliente"]),
        "armador":    s(r["Companhia de transporte"]),
        "navio":      s(r["Navio"]),
        "situacao":   s(r["Situação embarque"]),
        "exportador": s(r["Exportador"]),
        "mercadoria": s(r["Mercadoria"]),
        "fcl":        s(r["Tipo carga"]),
        "c20":        int(r["Total container 20'"]) if pd.notna(r["Total container 20'"]) else 0,
        "c40":        int(r["Total container 40'"]) if pd.notna(r["Total container 40'"]) else 0,
        "equip":      s(r["Equipamentos"]),
        "teus":       float(r["Total TEUS"]),
        "ano":        int(r["ANO"]) if pd.notna(r["ANO"]) else 0,
        "mes":        int(r["MES"]) if pd.notna(r["MES"]) else 0,
    })

j = json.dumps(records, ensure_ascii=True, separators=(',',':'))

with open(TEMPLATE, 'r', encoding='utf-8') as f:
    template = f.read()
with open(JS, 'r', encoding='utf-8') as f:
    js_novo = f.read()

start = template.find('<script>')
end   = template.find('</script>') + len('</script>')
html  = template[:start] + '<script>\n' + js_novo + '\n</script>' + template[end:]
html_final = html.replace('__JSON__', j)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html_final)

t25 = sum(r['teus'] for r in records if r['ano']==2025 and r['situacao']!='Cancelado' and r['fcl']=='FCL')
t26 = sum(r['teus'] for r in records if r['ano']==2026 and r['situacao']!='Cancelado' and r['fcl']=='FCL')
print(f"TEUs 2025: {t25:.0f} | 2026: {t26:.0f}")
print(f"Salvo: {OUT} ({len(html_final)//1024} KB)")
