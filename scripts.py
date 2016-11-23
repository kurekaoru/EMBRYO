import pandas
import sqlite3
con = sqlite3.connect('/home/kurekaoru/github/EMBRYO.db')

X = pandas.read_sql('select * from CELLCOL',con)


X['number'] = X.index
X['radius'] = 0.5
X['mass'] = 1

outfile = open('embryodata.txt','w')

for l in X.values:
	LINE = '{ \'symbol\': \''+l[0]+'\', \'name\': \''+l[0]+'\', \'mass\': '+str(l[7])+', \'radius\':'+str(1)+', \'color\': ['+str(l[1])[0:5]+','+str(l[2])[0:5]+','+str(l[3])[0:5]+'], \'number\':'+str(l[6])+'},'
	outfile.write(LINE+'\n')

outfile.close()


#{'symbol': 'P3', 'name': 'P3', 'mass': 296.00000000, 'radius': 1.5700, 'color': [0.622, 0.000, 0.149], 'number': 128 },
