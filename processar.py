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

cols = df.columns.tolist()
print(f"  Colunas: {cols}")

# Indices baseados na ordem real do CSV:
# 0=Nº processo house, 1=Nº Booking, 2=Data abertura processo,
# 3=ETD/ATD, 4=ETA/ATA, 5=Origem, 6=Destino, 7=Cliente,
# 8=Companhia de transporte, 9=Navio, 10=Situação embarque,
# 11=Exportador, 12=Mercadoria, 13=Tipo carga,
# 14=Total container 20', 15=Total container 40',
# 16=Equipamentos, 17=Total TEUS

df['_dt']  = pd.to_datetime(df[cols[2]], dayfirst=True, errors='coerce')
df['_etd'] = pd.to_datetime(df[cols[3]], dayfirst=True, errors='coerce')
df['_eta'] = pd.to_datetime(df[cols[4]], dayfirst=True, errors='coerce')
df['ANO']  = df['_dt'].dt.year
df['MES']  = df['_dt'].dt.month
df[cols[17]] = pd.to_numeric(df[cols[17]], errors='coerce').fillna(0)

def s(v):
    r = str(v).strip()
    return '' if r in ['nan','None','NaT',''] else r

def d(v):
    try: return v.strftime('%d/%m/%Y') if pd.notna(v) else ''
    except: return ''

def n(v):
    try: return int(pd.to_numeric(str(v).strip(), errors='coerce') or 0)
    except: return 0

records = []
for _, r in df.iterrows():
    records.append({
        "proc":       s(r[cols[0]]),
        "booking":    s(r[cols[1]]),
        "abertura":   d(r["_dt"]),
        "etd":        d(r["_etd"]),
        "eta":        d(r["_eta"]),
        "origem":     s(r[cols[5]]),
        "destino":    s(r[cols[6]]),
        "cliente":    s(r[cols[7]]),
        "armador":    s(r[cols[8]]),
        "navio":      s(r[cols[9]]),
        "situacao":   s(r[cols[10]]),
        "exportador": s(r[cols[11]]),
        "mercadoria": s(r[cols[12]]),
        "fcl":        s(r[cols[13]]),
        "c20":        n(r[cols[14]]),
        "c40":        n(r[cols[15]]),
        "equip":      s(r[cols[16]]),
        "teus":       float(pd.to_numeric(r[cols[17]], errors='coerce') or 0),
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
