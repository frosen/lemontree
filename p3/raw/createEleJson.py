#!/usr/bin/python
#coding:utf-8

import json
import os
import re
import shutil
import math
import copy

from createMapJson import clsnSize, sceneSpineData, readFile, parseCo, getDataFromTileJson, tileDoors, saveFile

# ================================================================================

spineFrom = 49
spineTo = 64
allSpines = []
for x in xrange(spineFrom, spineTo + 1):
    allSpines.append(x)

# 不可用的spine的替代品
spineDisableRule = {
    49: 1,
    50: 1,
    51: 1,
    52: 0,

    53: 0,
}

# 场景对应的可以用的spine
sceneSpineRule = {
    0 : allSpines,
    10: [53],
    11: [53],
    20: [49, 50, 51, 53],
    21: [49, 50, 51, 53],
}

platUpTile = 21
platBgTile = 24

platUpLefTile = 20
platUpRigTile = 22
platBgLefTile = 23
platBgRigTile = 25

platUpMidTile = 26
platBgMidTile = 27

platTiles = [platUpTile, platBgTile, platUpLefTile, platUpRigTile, platBgLefTile, platBgRigTile, platUpMidTile, platBgMidTile]

notationKeyLineFrom = clsnSize + 9
notationKeyRowFrom = clsnSize + 17

# ================================================================================

eleDatas = []

eleBases = []
eles = []
eleLists = {}

# 先获取所有tmx的数据
# 文件以ele_xx_x_??.tmx的形式命名
def getTMXFiles(path):
    global eleDatas

    fList = os.listdir(path)
    for f in fList:
        fileInfos = os.path.splitext(f)
        if fileInfos[1] == '.tmx':
            d = readFile(path + f)

            indexs = fileInfos[0].split("_")
            if indexs[0] != "ele" or indexs[1] == "base":
                continue

            if indexs[1] != "66" or indexs[2] != "04": # for test
                continue

            size = int(indexs[1])
            w = int(math.floor(size / 10))
            h = int(size % 10)

            data = {}
            data["tW"] = w
            data["tH"] = h
            data["d"] = d
            eleDatas.append(data)

# ================================================================================

# 根据map中的标识，处理元素生成数据，便于后面使用（最下面横着的一行数据）
def handleNotationLine(noList):
    notationLine = []
    maxH = len(noList) - 1
    lastRestrict = 0
    for x in xrange(0, 6):
        key = notationKeyLineFrom + x
        noLineList = []
        restrict = 0 # 限制，只有竖行的数大于等于这个数时，才生成
        hasNotation = False
        for i in xrange(2, len(noList[maxH]), 3):
            noData = noList[maxH][i]
            if noData <= 0:
                noLineList.append(1)
            elif noData < key:
                noLineList.append(0)
            elif noData == key:
                noLineList.append(0)
                hasNotation = True
                natationRestrict = noList[maxH][i + 1]
                if natationRestrict > 0:
                    restrict = natationRestrict
            else:
                noLineList.append(1)

        if hasNotation:
            if restrict < lastRestrict:
                raise Exception("restrict must more and more big than ", lastRestrict, " in ", i)
            lastRestrict = restrict

            data = {}
            data["list"] = noLineList
            data["restrict"] = restrict
            notationLine.append(data)

        else:
            for x in xrange(0, len(noLineList)):
                noLineList[x] = 1
            data = {}
            data["list"] = noLineList
            data["restrict"] = restrict
            notationLine.append(data)
            break

    return notationLine

# 竖行数据
def handleNotationRow(noList):
    notationRow = []
    maxH = len(noList) - 1

    # 这里从0到5意思是采用了tiled上的1到6
    # 肯定不会有6，因为不可能没有图，
    # 所以一定会出现hasNotation为false，此时增加一个所有的，key为0，意味着所有的restrict都会响应
    for x in xrange(0, 6):
        key = notationKeyRowFrom + x
        noRowList = []
        hasNotation = False
        for i in xrange(1, maxH, 3):
            noData = noList[i][0]
            if noData <= 0:
                noRowList.append(1)
            elif noData < key:
                noRowList.append(0)
            elif noData == key:
                noRowList.append(0)
                hasNotation = True
            else:
                noRowList.append(1)

        if hasNotation:
            data = {}
            data["list"] = noRowList
            data["key"] = key
            notationRow.append(data)

        else:
            for x in xrange(0, len(noRowList)):
                noRowList[x] = 1
            data = {}
            data["list"] = noRowList
            data["key"] = 0
            notationRow.append(data)
            break

    return notationRow

def getSpine(coList):
    spines = []
    for line in coList:
        for tile in line:
            if spineFrom <= tile and tile <= spineTo:
                if not tile in spines:
                    spines.append(tile)

    return sorted(spines)

def changeNotationListToNum(noList):
    k = 0
    for data in noList:
        k = k * 10 + data
    return k

def getListCount(noList):
    k = 0
    for data in noList:
        if data == 1:
            k += 1
    return k

MAX_R_TW = 6
MAX_R_TH = 6
MAX_DOOR_TYPE = 15
def createEleList():
    elist = []
    for _ in xrange(0, MAX_R_TW):
        wList = []
        for _ in xrange(0, MAX_R_TH):
            hList = []
            for _ in xrange(0, MAX_DOOR_TYPE):
                dList = []
                hList.append(dList)
            wList.append(hList)
        elist.append(wList)

    return elist

doorTypeList = {
    "lef": 0,
    "top": 1,
    "rig": 2,
    "bot": 3,

    "lef_top": 4,
    "rig_top": 5,
    "lef_bot": 6,
    "rig_bot": 7,
    "lef_rig": 8,
    "top_bot": 9,

    "lef_top_rig": 10,
    "top_rig_bot": 11,
    "rig_bot_lef": 12,
    "bot_lef_top": 13,

    "all": 14
}

def removeList(dList, key):
    if not doorTypeList.has_key(key):
        raise Exception("wrong ele door key")

    if dList.has_key(key):
        del dList[key]

def getEleDoorTypes(doorType):
    hasUp = len(doorType[0]) > 0
    hasDown = len(doorType[1]) > 0
    hasLeft = len(doorType[2]) > 0
    hasRight = len(doorType[3]) > 0

    dList = copy.deepcopy(doorTypeList)

    if hasUp:
        removeList(dList, "lef")
        removeList(dList, "rig")
        removeList(dList, "bot")

        removeList(dList, "lef_rig")
        removeList(dList, "lef_bot")
        removeList(dList, "rig_bot")
        removeList(dList, "rig_bot_lef")

    if hasDown:
        removeList(dList, "lef")
        removeList(dList, "rig")
        removeList(dList, "top")

        removeList(dList, "lef_rig")
        removeList(dList, "lef_top")
        removeList(dList, "rig_top")
        removeList(dList, "lef_top_rig")

    if hasLeft:
        removeList(dList, "top")
        removeList(dList, "rig")
        removeList(dList, "bot")

        removeList(dList, "top_bot")
        removeList(dList, "rig_top")
        removeList(dList, "rig_bot")
        removeList(dList, "top_rig_bot")

    if hasRight:
        removeList(dList, "lef")
        removeList(dList, "top")
        removeList(dList, "bot")

        removeList(dList, "top_bot")
        removeList(dList, "lef_top")
        removeList(dList, "lef_bot")
        removeList(dList, "bot_lef_top")

    numList = []
    for key in dList:
        n = dList[key]
        numList.append(n)
    return numList

def parseData():

    global eleDatas
    global eleBases
    global eles
    global eleLists

    for eleData in eleDatas:

        # 从json string提取tile数据
        coList = getDataFromTileJson(eleData["d"], "collision") # 碰撞
        noList = getDataFromTileJson(eleData["d"], "notation") # 标记

        if eleData["tW"] * 3 + 1 != len(coList[0]) or eleData["tH"] * 3 + 1 != len(coList):
            raise Exception("w or h error")

        # 解析标记
        notationLine = handleNotationLine(noList)
        notationRow = handleNotationRow(noList)

        # 处理spine，根据不同场景能使用的spine类型，分成几个不同的地图
        spines = getSpine(coList)

        coWithSpineDatas = [] # noUseString scenes co

        for key in sceneSpineRule:
            noUseList = []
            noUseString = ""
            validSpines = sceneSpineRule[key] # 获取每一个场景可以用的spine
            for s in spines:
                if not s in validSpines:
                    noUseList.append(s)
                    noUseString = noUseString + str(s)

            hasData = False
            for data in coWithSpineDatas:
                if data["noUseString"] == noUseString:
                    hasData = True
                    data["scenes"].append(key)
                    break

            if not hasData:
                data = {}
                data["noUseString"] = noUseString
                data["scenes"] = []
                data["scenes"].append(key)

                newCo = copy.deepcopy(coList)

                for j in xrange(0, len(newCo)):
                    coLine = newCo[j]
                    for i in xrange(0, len(coLine)):
                        coData = coLine[i]
                        if coData in noUseList:
                            newData = spineDisableRule[coData]
                            newCo[j][i] = newData

                data["co"] = newCo
                coWithSpineDatas.append(data)

        # 根据处理后的地图，生成元素
        k = -1
        for coWithSpineData in coWithSpineDatas:
            k += 1
            rawCo = coWithSpineData["co"]

            # 生成元素
            for lineData in notationLine:
                for rowData in notationRow:
                    if lineData["restrict"] > 0 and rowData["key"] < lineData["restrict"]:
                        continue

                    lineList = lineData["list"]
                    rowList = rowData["list"]

                    ele = {}

                    ele["baseIndex"] = k
                    ele["usingTXs"] = changeNotationListToNum(lineList)
                    ele["usingTYs"] = changeNotationListToNum(rowList)

                    eleW = getListCount(lineList)
                    eleH = getListCount(rowList)

                    ele["tW"] = eleW
                    ele["tH"] = eleH

                    ele["doorType"] = [[], [], [], []]

                    # 门和spine的位置
                    realI = -1
                    for i in xrange(0, len(lineList)):
                        lineUseData = lineList[i]
                        if lineUseData == 0:
                            continue
                        realI += 1
                        realJ = -1
                        for j in xrange(0, len(rowList)):
                            rowUseData = rowList[j]
                            if rowUseData == 0: # 选择横竖限制中值为1的位置
                                continue
                            realJ += 1

                            # 基础位置
                            bX = i * 3 + 1
                            bY = j * 3

                            # 门数据
                            upNo = noList[bY][bX]
                            downNo = noList[bY + 2][bX + 2]
                            leftNo = noList[bY + 2][bX]
                            rightNo = noList[bY][bX + 2]

                            # 门限制对于横竖选择的限制
                            upRe = noList[bY][bX + 1]
                            downRe = noList[bY + 2][bX + 1]
                            leftRe = noList[bY + 1][bX]
                            rightRe = noList[bY + 1][bX + 2]

                            rowKey = rowData["key"]

                            if realJ == 0 and upNo > 0 and (upRe == 0 or upRe <= rowKey):
                                ele["doorType"][0].append(realI)

                            if realJ == eleH - 1 and downNo > 0 and (downRe == 0 or downRe <= rowKey):
                                ele["doorType"][1].append(realI)

                            if realI == 0 and leftNo > 0 and (leftRe == 0 or leftRe <= rowKey):
                                ele["doorType"][2].append(realJ)

                            if realI == eleW - 1 and rightNo > 0 and (rightRe == 0 or rightNo <= rowKey):
                                ele["doorType"][3].append(realJ)

                            # spine list
                            sceneSpineData = []
                            for sX in xrange(0, 3):
                                for sY in xrange(0, 3):
                                    x = bX + sX
                                    y = bY + sY
                                    coData = rawCo[y][x]
                                    parseCo(coData, y, x, 0, 0, 0)

                            ele["spines"] = sceneSpineData

                    eles.append(ele)

                    # ele放入对应的表中
                    scenes = coWithSpineData["scenes"]

                    eleDoorTypes = getEleDoorTypes(ele["doorType"])
                    for scene in scenes:
                        if not eleLists.has_key(scene):
                            eleLists[scene] = createEleList()

                        for t in eleDoorTypes:
                            eleLists[scene][eleW - 1][eleH - 1][t].append(len(eles) - 1)

            # 生成元素模板
            eleBase = {}

            eleBase["tW"] = eleData["tW"]
            eleBase["tH"] = eleData["tH"]

            for j in xrange(0, len(rawCo)):
                    coLine = rawCo[j]
                    for i in xrange(0, len(coLine)):
                        coData = coLine[i]
                        newT = parseCo(coData, j, i, 0, 0, 0)
                        if newT:
                            rawCo[j][i] = newT
            eleBase["co"] = rawCo

            eleBases.append(eleBase)

            index = 0
            for ele in eles:
                index += 1
                print index, "------------------------------------------------------------------------------------"
                print ele["baseIndex"], "---", ele["usingTXs"], ele["usingTYs"], "w,h:", ele["tW"], ele["tH"]

                print "      上", ele["doorType"][0]
                print "      下", ele["doorType"][1]
                print "      左", ele["doorType"][2]
                print "      右", ele["doorType"][3]


            # print "/////"
            # print eleLists


# ================================================================================

def save(outPath):
    global eleBases
    global eles
    global eleLists

    data = {}
    data["bases"] = eleBases
    data["eles"] = eles
    data["list"] = eleLists

    jsonStr = json.dumps(data)
    jsStr = "module.exports = " + jsonStr + ";"
    saveFile(outPath, jsStr)

# ================================================================================

if '__main__' == __name__:
    path = "./map/"
    outPath = "./map/output/ele.js"

    print "go to create ELE"

    getTMXFiles(path)
    parseData()
    save(outPath)
    print "finish at: " + outPath
