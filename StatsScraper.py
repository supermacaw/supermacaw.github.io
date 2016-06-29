from bs4 import BeautifulSoup
import csv
import json
import urllib.request

soup = BeautifulSoup(urllib.request.urlopen("http://insider.espn.go.com/nba/hollinger/statistics").read())

myPlayerAndStatsList = soup.find_all(class_ = ["oddrow","evenrow"])


playerlist = []

for element in myPlayerAndStatsList:

        #could normalize each attribute to 30 or something
        
        playerName = element.find("a").string
        statsList = element.find_all("td")
        TSP = float(statsList[4].string) * 55
        AST = float(statsList[5].string) 
        RBR = float(statsList[10].string) * 1.5
        PER = float(statsList[11].string) * 1.25
        ORR = float(statsList[8].string) * 2
        DRR = float(statsList[9].string) * 1.3
        #print(playerName)
        sublist = [playerName, TSP, AST, RBR, PER, ORR, DRR]
        playerlist.append(sublist)
        

jsfile = open('MatchedStats.js','w')
jsfile.write("var statsData = ")
jsfile.write(json.dumps(playerlist))
jsfile.write(";")

