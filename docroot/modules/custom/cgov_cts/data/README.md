The zip_codes.json file was created using the US Postal Codes database from [GeoNames](http://www.geonames.org/). The specific file used was https://download.geonames.org/export/zip/US.zip. This tab delimited file was translated into a JSON format.

The script to translate the contents is below. It reads the tab delimited format from stdin and outputs to std out. (e.g. `cat US.txt | python conv.py > zipcodes.json` if you name the script conv.py)

```
import sys
import json

def read_in():
  data={}
  lines = sys.stdin.readlines()
  for i in range(len(lines)):
    lines[i] = lines[i].replace('\n','')
    sp=lines[i].split("\t")
    data[sp[1]] = {"lat": float(sp[9]), "long": float(sp[10])}
    ## data.setdefault("data",[]).append({sp[1]: {"lat": float(sp[9]), "long": float(sp[10])}})
  return data

def main():
  data = read_in()
  print(json.dumps(data))

if __name__ == '__main__':
  main()
```
