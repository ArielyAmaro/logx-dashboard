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
            print(f"  Encoding: {enc} | {len(df)} registros | colunas: {df.columns.tolist()}")
            break
    except:
        continue

if df is None:
    print("ERRO: nao foi possivel ler o CSV.")
    sys.exit(1)

# Mapear colunas por posição (evita problemas com caracteres especiais)
cols = df.columns.tolist()
print(f"  Colunas: {cols}")

df['_dt']  = pd.to_datetime(df[cols[0]], dayfirst=True, errors='coerce')
df['_etd'] = pd.to_datetime(df[cols[4]], dayfirst=True, errors='coerce')
df['_eta'] = pd.to_datetime(df[cols[5]], dayfirst=True, errors='coerce')
df['ANO']  = df['_dt'].dt.year
df['MES']  = df['_dt'].dt.month
df[cols[17]] = pd.to_numeric(df[cols[17]], errors='coerce').fillna(0)

def s(v):
    r = str(v).strip()
    return '' if r in ['nan','None','NaT',''] else r

def d(v):
    try: return v.strftime('%d/%m/%Y') if pd.notna(v) else ''
    except: return ''

records = []
for _, r in df.iterrows():
    records.append({
        "proc":       s(r[cols[1]]),
        "booking":    s(r[cols[2]]),
        "abertura":   d(r["_dt"]),
        "etd":        d(r["_etd"]),
        "eta":        d(r["_eta"]),
        "origem":     s(r[cols[6]]),
        "destino":    s(r[cols[7]]),
        "cliente":    s(r[cols[8]]),
        "armador":    s(r[cols[9]]),
        "navio":      s(r[cols[10]]),
        "situacao":   s(r[cols[11]]),
        "exportador": s(r[cols[12]]),
        "mercadoria": s(r[cols[13]]),
        "fcl":        s(r[cols[14]]),
        "c20":        int(r[cols[15]]) if pd.notna(r[cols[15]]) else 0,
        "c40":        int(r[cols[16]]) if pd.notna(r[cols[16]]) else 0,
        "equip":      s(r[cols[3]]),
        "teus":       float(r[cols[17]]),
        "ano":        int(r["ANO"]) if pd.notna(r["ANO"]) else 0,
        "mes":        int(r["MES"]) if pd.notna(r["MES"]) else 0,
    })

j = json.dumps(records, ensure_ascii=True, separators=(',',':'))

with open(TEMPLATE, 'r', encoding='utf-8') as f:
    template = f.read()
with open(JS, 'r', encoding='utf-8') as f:
    js_novo = f.read()

start = template.find('<script>')
end   =
