import pandas as pd, json, sys, os, warnings
warnings.filterwarnings("ignore")

CSV='Relatorio_IAN.csv'; TEMPLATE='dash_v4_template.html'; JS='js_v4.js'; OUT='index.html'

if not os.path.exists(CSV):
    print(f"AVISO: {CSV} nao encontrado."); sys.exit(0)

df = None
for enc in ['ISO-8859-1','utf-8','cp1252']:
    try:
        tmp = pd.read_csv(CSV, encoding=enc, sep=';')
        if len(tmp.columns)>5: df=tmp; break
    except: continue
if df is None: print("ERRO: nao foi possivel ler o CSV"); sys.exit(1)

template = open(TEMPLATE, encoding='utf-8').read()
js_novo  = open(JS, encoding='ascii').read()

cols = df.columns.tolist()
# 0=proc,1=booking,2=abertura,3=ETD,4=ETA,5=origem,6=destino,
# 7=cliente,8=armador,9=navio,10=situacao,11=exportador,12=mercadoria,
# 13=tipo carga,14=c20,15=c40,16=equip,17=teus

def s(v):
    if pd.isna(v): return ''
    return str(v).strip()

def n(v):
    try: return int(pd.to_numeric(str(v).strip(), errors='coerce') or 0)
    except: return 0

def parse_date(v):
    v=s(v)
    if not v: return ''
    # format: DD/MM/YYYY HH:MM or DD/MM/YYYY
    return v.split(' ')[0]

def get_mes_ano(v):
    v=s(v)
    if not v: return 0, 0
    parts = v.split(' ')[0].split('/')
    if len(parts)==3:
        try: return int(parts[1]), int(parts[2])
        except: pass
    return 0, 0

records = []
for _, row in df.iterrows():
    vals = [row.iloc[i] if i < len(row) else '' for i in range(18)]
    abertura = s(vals[2])
    etd      = parse_date(vals[3])
    # use ETD for mes/ano (embarque), fallback abertura
    if etd:
        mes, ano = get_mes_ano(vals[3])
    else:
        mes, ano = get_mes_ano(vals[2])

    tipo = s(vals[13]).upper()
    # only FCL records

    rec = {
        'proc':      s(vals[0]),
        'booking':   s(vals[1]),
        'abertura':  parse_date(vals[2]),
        'etd':       etd,
        'eta':       parse_date(vals[4]),
        'origem':    s(vals[5]),
        'destino':   s(vals[6]),
        'cliente':   s(vals[7]),
        'armador':   s(vals[8]),
        'navio':     s(vals[9]),
        'situacao':  s(vals[10]),
        'exportador':s(vals[11]),
        'mercadoria':s(vals[12]),
        'fcl':       'FCL' if 'FCL' in tipo else tipo,
        'c20':       n(vals[14]),
        'c40':       n(vals[15]),
        'equip':     s(vals[16]),
        'teus':      n(vals[17]),
        'mes':       mes,
        'ano':       ano
    }
    records.append(rec)

j = json.dumps(records, ensure_ascii=True, separators=(',',':'))

# Insert JS and JSON into template
html = template.replace('__JS__', js_novo)
html = html.replace('__JSON__', j)

open(OUT, 'w', encoding='utf-8').write(html)
print(f"Dashboard gerado: {OUT} ({len(records)} registros, {len(html)//1024}KB)")
