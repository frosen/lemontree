#!/usr/bin/python
# coding:utf-8

import json
import os
import re
import shutil
import math
import copy
import sys

# 常量 ================================================================================

arrayMax = 20

clsnSize = 256  # 碰撞层瓦块的总数

# 平台
platUpLefTile = 20
platUpTile = 21
platUpRigTile = 22
platBgLefTile = 23
platBgTile = 24
platBgRigTile = 25

platUpMidTile = 26
platBgMidTile = 27

platTiles = [platUpTile, platBgTile, platUpLefTile, platUpRigTile,
             platBgLefTile, platBgRigTile, platUpMidTile, platBgMidTile]

# 门
tileRandom = 40
tileDoorUp = 41
tileDoorDown = 42
tileDoorLeft = 43
tileDoorRight = 44
tileDoors = [tileDoorUp, tileDoorDown, tileDoorLeft, tileDoorRight]

tileNoEnemy = 45

tileMoveFrom = 49
tileRightMove = 49
tileLeftMove = 50
tileJump = 51
tileUpMove = 52
tileMoveTo = 52

tileSpineFrom = 53
tileSpine = 53
tileSpineTo = 64

tileGateFrom = 65
tileGateTo = 80

tileHero = 81

thumbInterval = 3  # 缩略图的宽度

RThumb = 0  # 随机大块
FiThumb = 1  # 固定大块

# 标记块
notationKey2Jump = clsnSize + 3
notationKeyLineFrom = clsnSize + 9
notationKeyRowFrom = clsnSize + 17

MAX_R_TW = 7
MAX_R_TH = 6
MAX_DOOR_TYPE = 15

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

# 功能方法 ================================================================================


def readFile(filePath):
    fp = None
    d = ""
    try:
        fp = open(filePath, "r")
        d = fp.read()

    except Exception, e:
        print("read " + filePath + " exception! " +
              str(Exception) + ":" + str(e))

    finally:
        if fp:
            fp.close()

    if d == "":
        print("read " + filePath + " no res! ")
    return d


def saveFile(path, data):
    fp = None
    try:
        fp = open(path, "w")
        fp.write(data)

    except Exception, e:
        print("save " + path + " exception! " + str(Exception) + ":" + str(e))

    finally:
        if fp:
            fp.close()

def getWHFromTileJson(jsonStr):
    wStr = re.findall(r" width=\"(.+?)\"", jsonStr)[0]
    hStr = re.findall(r" height=\"(.+?)\"", jsonStr)[0]
    w = int(wStr)
    h = int(hStr)
    return w, h


def getDataFromTileJson(jsonStr, key):
    k1 = "<layer (id=\"\d\" )?name=\"" + key + r"\"([\s\S]*?)</layer>"
    k2 = r"<data encoding=\"csv\">\n([\s\S]*?)\n</data>"
    subStr = re.findall(k1, jsonStr)[0][1]
    subStr = re.findall(k2, subStr)[0]
    lineStrs = subStr.split("\n")
    tilelist = []
    for line in lineStrs:
        tileData = line.split(",")
        tileLineList = []
        for tileStr in tileData:
            if len(tileStr) < 1:
                continue
            tile = int(tileStr)
            tileLineList.append(tile)

        tilelist.append(tileLineList)

    return tilelist


# 得到一个块的最下的中点
TileLength = 32


def getPX(x):
    return int(x * TileLength + TileLength * 0.5)


def getPY(y, h):
    return int(h - y - 1) * TileLength


class MapCreator:
    def createMap(self):
        path = "./map/"
        # outPath = "../assets/resources/map/"
        outPath = "./map/output/"

        print "go to create map json"

        self.initMapStrData()
        self.getStrDataFromMapTMXFiles(path)
        self.parseMapStrData()
        self.saveJsonAndImg(outPath, path)
        print "finish at: " + outPath

    def initMapStrData(self):
        # 所有map txm的数据，mapdata[场景(从0开始，0是home)][地图(从0开始)]
        self.mapStrData = [[]] * arrayMax

        # 所有地图的类型 [场景(从0开始，0是home)][地图(从0开始)]
        self.mapType = [[]] * arrayMax

        # 转换后的json数据 jsonDataList[场景]
        self.jsonDataList = []

        # 场景属性
        self.attriJson = None

    # 先获取所有tmx的数据
    # 文件以scene_m_n.tmx的形式命名
    def getStrDataFromMapTMXFiles(self, path):
        fList = os.listdir(path)
        for f in fList:
            fileInfos = os.path.splitext(f)
            if fileInfos[1] == '.tmx':
                d = readFile(path + f)
                indexs = fileInfos[0].split("_")
                if indexs[0] != "scene":
                    continue

                i = int(indexs[1])
                j = int(indexs[2])

                if len(self.mapStrData[i]) == 0:
                    self.mapStrData[i] = [None] * arrayMax
                self.mapStrData[i][j] = d

                if len(self.mapType[i]) == 0:
                    self.mapType[i] = [0] * arrayMax  # 普通类型为0
                # scene有可能分两个部分，那么后一部分就是advance 用1表示
                if len(indexs) == 4 and indexs[3] == "ad":
                    self.mapType[i][j] = 1

    # 解析mapData
    def parseMapStrData(self):

        sceneIndex = 0
        for sceneStrData in self.mapStrData:
            if (len(sceneStrData) == 0):
                break

            finalData = {}

            areaDataList = []
            areaTypes = []

            # 场景数据
            self.sceneHeroData = []
            self.sceneDoorData = {}
            self.midDoors = {}

            areaIndex = 0
            for areaStrData in sceneStrData:
                if not areaStrData:
                    break

                print "parse scene {} area {}".format(sceneIndex, areaIndex)
                if sceneIndex == 0:  # 0是home，要特殊处理
                    areaData = self.parseHome(areaStrData, areaIndex, sceneIndex)
                else:
                    areaData = self.parse(areaStrData, areaIndex, sceneIndex)

                areaDataList.append(areaData)
                areaTypes.append(self.mapType[sceneIndex][areaIndex])
                areaIndex = areaIndex + 1

            if sceneIndex == 0:
                finalData["areas"] = areaDataList
            else:
                finalData["areaTemps"] = areaDataList

            finalData["areaTypes"] = areaTypes
            finalData["heros"] = self.sceneHeroData
            finalData["gates"] = self.sceneDoorData

            attri = self.readAttriJson(sceneIndex)
            finalData["attri"] = attri["scene"]

            self.jsonDataList.append(finalData)
            sceneIndex += 1

    # 解析对应的场景的区域 {w h te co}
    # 顺便解析了其他的数据：
    # param string 一个区域的数据文本
    # param areaIndex 区域索引 从0开始
    def parseHome(self, string, areaIndex, sceneIndex):

        self.doorIndexs = {}
        self.areaSpineData = []

        # 获取宽高
        w, h = getWHFromTileJson(string)

        # 从json string提取tile数据
        teList = getDataFromTileJson(string, "terrain")  # 地形
        coList = getDataFromTileJson(string, "collision")  # 碰撞
        noList = getDataFromTileJson(string, "notation")  # 标记

        # 遍历标记，获取门等信息
        for j in xrange(0, len(noList)):
            noLine = noList[j]
            for i in xrange(0, len(noLine)):
                noData = noLine[i]
                self.parseNo(noData, j, i, w, h, areaIndex)

        # 遍历碰撞，获取门信息
        for j in xrange(0, len(coList)):
            coLine = coList[j]
            for i in xrange(0, len(coLine)):
                coData = coLine[i]
                newT = self.parseCo(coData, j, i, w, h, areaIndex)
                coList[j][i] = newT

        realTeList = []
        for line in teList:
            realLine = []
            for tdata in line:
                realLine.append(self.parseTe(tdata))
            realTeList.append(realLine)

        data = {}
        data["rW"] = w
        data["rH"] = h
        data["te"] = realTeList
        data["co"] = coList

        data["spines"] = self.areaSpineData
        attri = self.readAttriJson(sceneIndex)
        data["attri"] = attri["areas"][areaIndex]

        return data

    # 解析对应的场景的区域 {w h noeps fi[ {x y w h te co d[] } ] r }
    # 顺便解析了其他的数据：
    # param string 一个区域的数据文本
    # param areaIndex 区域索引 从0开始
    def parse(self, string, areaIndex, sceneIndex):

        self.noEnemyPosData = []
        self.areaSpineData = []

        # 获取宽高
        w, h = getWHFromTileJson(string)

        # 从json string提取tile数据
        teList = getDataFromTileJson(string, "terrain")  # 地形
        coList = getDataFromTileJson(string, "collision")  # 碰撞
        noList = getDataFromTileJson(string, "notation")  # 标记

        # 遍历标记，获取无敌人区域，spine等信息
        for j in xrange(0, len(noList)):
            noLine = noList[j]
            for i in xrange(0, len(noLine)):
                noData = noLine[i]
                self.parseNo(noData, j, i, w, h, areaIndex)

        # 遍历碰撞，获取门信息
        for j in xrange(0, len(coList)):
            coLine = coList[j]
            for i in xrange(0, len(coLine)):
                coData = coLine[i]
                newT = self.parseCo(coData, j, i, w, h, areaIndex)
                coList[j][i] = newT

        # 遍历碰撞，获取随机区域和固定区域
        rList = self.parseRList(coList, w, h)

        # 根据rList中记录的固定区域，记录固定区域相关信息
        fi = self.parseFi(rList, w, h, teList, coList, noList)

        data = {}
        data["rW"] = w
        data["rH"] = h
        data["noeps"] = self.noEnemyPosData
        data["ra"] = rList
        data["fis"] = fi

        data["spines"] = self.areaSpineData
        attri = self.readAttriJson(sceneIndex)
        data["attri"] = attri["areas"][areaIndex]

        return data

    # 去掉碰撞层的影响
    def parseTe(self, t):
        if t > clsnSize:
            return t - clsnSize
        else:
            return t

    # 解析标记
    def parseNo(self, t, lineNum, colNum, w, h, area):

        if t == tileNoEnemy:
            self.noEnemyPosData.append(colNum * 1000 + lineNum)

        elif t == tileHero:
            # hero pos

            thisHeroData = {}
            thisHeroData["pX"] = getPX(colNum)
            thisHeroData["pY"] = getPY(lineNum, h)
            thisHeroData["area"] = area
            thisHeroData["id"] = t
            self.sceneHeroData.append(thisHeroData)

    # 解析碰撞
    def parseCo(self, t, lineNum, colNum, w, h, area, xOffset=0, yOffset=0):

        keyDight = 100  # 标记的数位

        if tileGateFrom <= t and t <= tileGateTo:
            # 门
            key = 6 # 从6开始是考虑到512以下会是正常的tile

            if not self.doorIndexs.has_key(t):
                self.doorIndexs[t] = 1
            else:
                self.doorIndexs[t] += 1
                if self.doorIndexs[t] > 9:
                    raise Exception("door index couldn't more than 9!!")

            direction = 0
            if lineNum == 0:
                direction = 1
            elif lineNum == h - 1:
                direction = 2
            elif colNum == 0:
                direction = 3
            elif colNum == w - 1:
                direction = 4
            else:
                direction = 5  # 在中间的门

            # 新数据
            newT = t * 100000 + direction * 10000 + \
                self.doorIndexs[t] * 1000 + key * keyDight + 0  # 门都是可通过的

            if direction == 5:
                if not self.midDoors.has_key(newT):
                    self.midDoors[newT] = True
                else:
                    newT += 10000 # 这句话的意思是把direction变成6，这样才不会重复

            # 门数据记录到门的列表中
            thisDoorData = {}
            thisDoorData["pX"] = getPX(colNum) + xOffset
            thisDoorData["pY"] = getPY(lineNum, h) + yOffset
            thisDoorData["area"] = area
            thisDoorData["id"] = newT

            if not self.sceneDoorData.has_key(t):
                self.sceneDoorData[t] = {}

            if not self.sceneDoorData[t].has_key(self.doorIndexs[t]):
                self.sceneDoorData[t][self.doorIndexs[t]] = []

            if len(self.sceneDoorData[t][self.doorIndexs[t]]) >= 2:
                raise Exception("door at ", colNum, lineNum, "wrong")

            self.sceneDoorData[t][self.doorIndexs[t]].append(thisDoorData)

            return newT

        elif tileMoveFrom <= t and t <= tileMoveTo:
            # 强制移动
            key = 7
            realTile = 0

            if t == tileRightMove:
                realTile = 1  # lly todo 强制移动用spine实现

            elif t == tileLeftMove:
                realTile = 1

            elif t == tileJump:
                realTile = 1

            elif t == tileUpMove:
                realTile = 0

            return t * 1000 + key * keyDight + realTile

        elif tileSpineFrom <= t and t <= tileSpineTo:
            key = 8
            realTile = 0

            if t == tileSpine:
                # spine
                thisSpineData = {}
                thisSpineData["pX"] = getPX(colNum) + xOffset
                thisSpineData["pY"] = getPY(lineNum, h) + yOffset
                thisSpineData["id"] = t - tileSpineFrom

                self.areaSpineData.append(thisSpineData)

            return t * 1000 + key * keyDight + realTile
        else:
            return t

    # 3*3的块，左上角是随机块的就是随机，否则是固定
    def parseRList(self, coList, w, h):
        rx = 1
        ry = 0
        xLast = w - 2
        yLast = h - 1

        rList = []  # 随机区域标记

        while True:
            if ry >= yLast:
                break

            rLine = []
            _x = rx
            while True:
                if _x > xLast:
                    break

                # 开始 =======================================

                # 获取位置元素
                coData = coList[ry][_x]
                # 查看是否是随机块
                if coData == tileRandom:
                    rLine.append(RThumb)
                else:
                    rLine.append(FiThumb)

                # 结束 =======================================
                _x += thumbInterval

            rList.append(rLine)
            ry += thumbInterval

        return rList

    def parseFi(self, rList, w, h, teList, coList, noList):
        fi = []  # [ {x y w h te co d[] } ]
        used = {}  # 已用过的区域

        rListLen = len(rList)
        for rLineIndex in xrange(0, rListLen):
            rLine = rList[rLineIndex]
            rLineLen = len(rLine)
            for rDataIndex in xrange(0, rLineLen):
                rData = rLine[rDataIndex]
                if rData != FiThumb:
                    continue
                if used.has_key(self.getIndex(rDataIndex, rLineIndex)):
                    continue

                # 查看大小
                fiY = rLineIndex
                fiX = rDataIndex

                while True:  # 看宽度
                    if fiX + 1 >= rLineLen or rLine[fiX + 1] != 1:
                        break
                    fiX += 1

                while True:  # 看高度
                    if fiY + 1 >= rListLen or rList[fiY + 1][fiX] != 1:
                        break
                    fiY += 1

                # 记录到“已用过的区域”
                for y in xrange(rLineIndex, fiY + 1):
                    for x in xrange(rDataIndex, fiX + 1):
                        used[self.getIndex(x, y)] = 1

                realY = rLineIndex * thumbInterval
                realYMax = (fiY + 1) * thumbInterval
                realX = rDataIndex * thumbInterval + 1
                realXMax = (fiX + 1) * thumbInterval + 1

                realW = realXMax - realX
                realH = realYMax - realY

                # 靠边的块要加上边缘
                if realX == 1:
                    realX = 0
                    realW += 1

                if realXMax == w - 1:
                    realW += 1

                if realYMax == h - 1:
                    realH += 1

                oneFi = {}

                # 基础属性
                oneFi["rX"] = realX
                oneFi["rY"] = realY
                oneFi["rW"] = realW
                oneFi["rH"] = realH

                oneFi["tX"] = rDataIndex
                oneFi["tY"] = rLineIndex
                oneFi["tW"] = fiX + 1 - rDataIndex
                oneFi["tH"] = fiY + 1 - rLineIndex

                # 区域的地形和碰撞
                fite = []
                fico = []

                for y in xrange(realY, realY + realH):
                    fiteLine = []
                    ficoLine = []

                    for x in xrange(realX, realX + realW):
                        te = teList[y][x]
                        fiteData = self.parseTe(te)
                        ficoData = coList[y][x]
                        fiteLine.append(fiteData)
                        ficoLine.append(ficoData)

                    fite.append(fiteLine)
                    fico.append(ficoLine)

                oneFi["te"] = fite
                oneFi["co"] = fico

                # 区域的门信息
                doorUp = []  # 记录九宫格的左上角
                doorDown = []  # 记录九宫格的左下角
                doorLeft = []  # 记录九宫格的左上角
                doorRight = []  # 记录九宫格的右上角
                substitutes = [0, 1, 2, 3]  # 不通方向的替代，默认0-3就是上下左右，也就是不用替代

                doorNotation = tileDoors
                FiY = -1
                for thumbY in xrange(rLineIndex, fiY + 1):
                    FiY += 1
                    y = thumbY * thumbInterval
                    FiX = -1
                    for thumbX in xrange(rDataIndex, fiX + 1):
                        FiX += 1
                        x = thumbX * thumbInterval + 1

                        # 上下左右
                        if y - 1 >= 0:
                            c = noList[y - 1][x]
                            if c in doorNotation:
                                if c != doorNotation[0]:
                                    substitutes[0] = doorNotation.index(c)
                                    doorUp = []

                                if substitutes[0] == 0:
                                    doorUp.append(FiX)

                        if y + 3 < h - 1:
                            c = noList[y + 3][x]
                            if c in doorNotation:
                                if c != doorNotation[1]:
                                    substitutes[1] = doorNotation.index(c)
                                    doorDown = []

                                if substitutes[1] == 1:
                                    doorDown.append(FiX)

                        if x - 1 >= 1:
                            c = noList[y][x - 1]
                            if c in doorNotation:
                                if c != doorNotation[2]:
                                    substitutes[2] = doorNotation.index(c)
                                    doorLeft = []

                                if substitutes[2] == 2:
                                    doorLeft.append(FiY)

                        if x + 3 < w - 2:
                            c = noList[y][x + 3]
                            if c in doorNotation:
                                if c != doorNotation[3]:
                                    substitutes[3] = doorNotation.index(c)
                                    doorRight = []

                                if substitutes[3] == 3:
                                    doorRight.append(FiY)

                door = []
                door.append(doorUp)
                door.append(doorDown)
                door.append(doorLeft)
                door.append(doorRight)

                oneFi["door"] = door
                oneFi["substitutes"] = substitutes

                fi.append(oneFi)
        return fi

    def getIndex(self, x, y):
        return x * 1000 + y

    # 获取对应场景的attri scene0是home
    def readAttriJson(self, sceneIndex):

        if not self.attriJson:
            with open("./map/mapAttri.json", 'r') as load_f:
                self.attriJson = json.load(load_f)

        if sceneIndex >= len(self.attriJson):
            return {}
        else:
            return self.attriJson[sceneIndex]

    def saveJsonAndImg(self, path, oldPath):
        index = 0
        for jsonData in self.jsonDataList:
            jsonStr = json.dumps(jsonData)
            jsStr = "module.exports = " + jsonStr + ";"

            realPath = path + "scene" + str(index) + "/"
            if not os.path.exists(realPath):
                os.makedirs(realPath)

            realFile = realPath + "scenedata_" + str(index) + ".js"
            saveFile(realFile, jsStr)

            oldImgName = oldPath + "scene_" + str(index) + ".png"
            newImgName = realPath + "tiles.png"
            shutil.copyfile(oldImgName, newImgName)

            index += 1


class EleCreator(MapCreator):
    def createEle(self, inputPath=None):
        path = "./map/"
        outPath = "./map/output/ele.js"

        print "go to create ELE"

        self.initEleData()
        self.getEleTMXFiles(path, inputPath)
        self.parseEleData()
        self.saveEle(outPath)
        print "finish at: " + outPath

    def initEleData(self):
        self.eleDatas = []

        self.eleBases = []
        self.eles = []
        self.eleLists = None

    # 先获取所有tmx的数据
    # 文件以ele_xx_x_??.tmx的形式命名
    def getEleTMXFiles(self, path, inputPath):
        fList = os.listdir(path)
        for f in fList:
            fileInfos = os.path.splitext(f)

            if inputPath and inputPath != f:
                continue

            if fileInfos[1] == '.tmx':
                d = readFile(path + f)

                indexs = fileInfos[0].split("_")
                if indexs[0] != "ele" or indexs[1] == "base":
                    continue

                size = int(indexs[1])
                w = int(math.floor(size / 10))
                h = int(size % 10)

                data = {}
                data["tW"] = w
                data["tH"] = h
                data["d"] = d
                self.eleDatas.append(data)

    def parseEleData(self):

        k = -1
        for eleData in self.eleDatas:

            # 从json string提取tile数据
            coList = getDataFromTileJson(eleData["d"], "collision")  # 碰撞
            coList = self.handleCoList(coList)
            noList = getDataFromTileJson(eleData["d"], "notation")  # 标记

            if eleData["tW"] * 3 != len(coList[0]) or eleData["tH"] * 3 != len(coList):
                raise Exception("w or h error")

            # 解析标记
            notationLine = self.handleNotationLine(noList)
            notationRow = self.handleNotationRow(noList)

            # 检测spine，不能是强制移动类
            self.checkSpine(coList)

            # 生成元素
            k += 1
            rawCo = coList

            # 生成元素
            for lineData in notationLine:
                for rowData in notationRow:
                    if lineData["restrict"] >= notationKeyRowFrom and rowData["key"] < lineData["restrict"]:
                        continue

                    lineList = lineData["list"]
                    rowList = rowData["list"]

                    ele = {}
                    ele["bi"] = k
                    ele["uTX"] = self.changeNotationListToNum(lineList)
                    ele["uTY"] = self.changeNotationListToNum(rowList)

                    eleW = self.getListCount(lineList)
                    eleH = self.getListCount(rowList)

                    ele["tW"] = eleW
                    ele["tH"] = eleH

                    ele["sp"] = []

                    doorTypeScene1 = [[], [], [], []]
                    doorType2Jump = [[], [], [], []]
                    door2Jump = False  # 如果这个标识为true，则会生成2个不同的ele，其中一个不包含某个门在第一关使用

                    need2Jump = False  # 如果这个标识为true，则当前的ele不能在第一关使用
                    if rowData["restrict"] == notationKey2Jump:
                        need2Jump = True

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
                            if rowUseData == 0:  # 选择横竖限制中值为1的位置
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

                            # 检测门数据和限制数据
                            if not upNo in [0, tileDoorUp] or not downNo in [0, tileDoorDown] or \
                                    not leftNo in [0, tileDoorLeft] or not rightNo in [0, tileDoorRight]:
                                raise Exception("%d, %d 的大块方向有误" % (i, j))

                            reRange = [
                                0, notationKey2Jump,
                                notationKeyRowFrom, notationKeyRowFrom + 1, notationKeyRowFrom + 2,
                                notationKeyRowFrom + 3, notationKeyRowFrom + 4, notationKeyRowFrom + 5
                            ]
                            if not upRe in reRange or not downRe in reRange or not leftRe in reRange or not rightRe in reRange:
                                raise Exception("%d, %d 的大块的方向限制有误" % (i, j))

                            # 是否其中的门需要2连跳
                            if upRe == notationKey2Jump or downRe == notationKey2Jump or leftRe == notationKey2Jump or rightRe == notationKey2Jump:
                                door2Jump = True

                            # 获取门方向（如果门需要2连跳，则另外记录在一个list中）
                            rowKey = rowData["key"]
                            if realJ == 0 and upNo > 0:
                                if upRe == notationKey2Jump:
                                    doorType2Jump[0].append(realI)
                                elif upRe == 0 or upRe <= rowKey:
                                    doorTypeScene1[0].append(realI)
                                    doorType2Jump[0].append(realI)

                            if realJ == eleH - 1 and downNo > 0:
                                if downRe == notationKey2Jump:
                                    doorType2Jump[1].append(realI)
                                elif downRe == 0 or downRe <= rowKey:
                                    doorTypeScene1[1].append(realI)
                                    doorType2Jump[1].append(realI)

                            if realI == 0 and leftNo > 0:
                                if leftRe == notationKey2Jump:
                                    doorType2Jump[2].append(realJ)
                                elif leftRe == 0 or leftRe <= rowKey:
                                    doorTypeScene1[2].append(realJ)
                                    doorType2Jump[2].append(realJ)

                            if realI == eleW - 1 and rightNo > 0:
                                if rightRe == notationKey2Jump:
                                    doorType2Jump[3].append(realJ)
                                elif rightRe == 0 or rightNo <= rowKey:
                                    doorTypeScene1[3].append(realJ)
                                    doorType2Jump[3].append(realJ)

                            # 计算除去的块数
                            removeX = (realI - i) * 3 * TileLength
                            removeY = (realJ - j) * 3 * TileLength

                            # spine list
                            self.areaSpineData = []
                            for sX in xrange(0, 3):
                                for sY in xrange(0, 3):
                                    x = bX - 1 + sX  # -1 是因为co已经处理过，去除了左下边缘
                                    y = bY + sY
                                    coData = rawCo[y][x]
                                    self.parseCo(
                                        coData, y, x, 0, eleH * 3, 0, removeX, -removeY)

                            for spine in self.areaSpineData:
                                ele["sp"].append(spine)

                    # 上或左右有门，进行一定的检测 todo

                    # 门放入表格中后，把表格放入所有ele的list中

                    if need2Jump:
                        ele["doorType"] = doorType2Jump
                        self.eles.append(self.getEleArray(ele))
                        self.setEleIntoList(ele, 1)

                    # 如果门需要2连跳，则生成2个ele，另外一个的门数据改成需要2连跳的，分别放入场景1-0和其他场景
                    elif door2Jump:
                        ele["doorType"] = doorType2Jump
                        self.eles.append(self.getEleArray(ele))
                        self.setEleIntoList(ele, 1)

                        eleScene1 = copy.deepcopy(ele)
                        eleScene1["doorType"] = doorTypeScene1
                        self.eles.append(self.getEleArray(eleScene1))
                        self.setEleIntoList(eleScene1, 0)
                    else:
                        ele["doorType"] = doorType2Jump
                        self.eles.append(self.getEleArray(ele))
                        self.setEleIntoList(ele, 0)
                        self.setEleIntoList(ele, 1)

            # 生成元素模板
            eleBase = {}

            eleBase["tW"] = eleData["tW"]
            eleBase["tH"] = eleData["tH"]

            # 模板中的有些数据会被解析时修改
            for j in xrange(0, len(rawCo)):
                coLine = rawCo[j]
                for i in xrange(0, len(coLine)):
                    coData = coLine[i]
                    newT = self.parseCo(coData, j, i, 0, 0, 0)
                    if newT != coData:
                        rawCo[j][i] = newT
            eleBase["co"] = rawCo

            self.eleBases.append(eleBase)

        # 检测elelist里面是否有空
        for i in xrange(0, len(self.eleLists)):
            eleListHD = self.eleLists[i]
            for j in xrange(0, len(eleListHD)):
                eleListD = eleListHD[j]
                for k in xrange(0, len(eleListD)):
                    eleList = eleListD[k]
                    len0 = len(eleList[0])
                    len1 = len(eleList[1])
                    if len0 == 0 or len1 == 0:
                        doorStr = ""
                        for doorK in doorTypeList:
                            d = doorTypeList[doorK]
                            if d == k:
                                doorStr = doorK
                                break
                            print("ele list empty: w %d, h %d, door %12s ==> %d, %d" % (
                                i+1, j+1, doorStr, len0, len1))

    # 根据map中的标识，处理元素生成数据，便于后面使用（最下面横着的一行数据）
    def handleNotationLine(self, noList):
        notationLine = []
        maxH = len(noList) - 1
        lastRestrict = 0
        for x in xrange(0, MAX_R_TW):
            key = notationKeyLineFrom + x
            noLineList = []
            restrict = 0  # 限制，只有竖行的数大于等于这个数时，才生成
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
                if restrict == notationKey2Jump:
                    raise Exception("line can not use 2 jump key")
                if restrict < lastRestrict:
                    raise Exception(
                        "restrict must more and more big than ", lastRestrict, " in ", i)
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
    def handleNotationRow(self, noList):
        notationRow = []
        maxH = len(noList) - 1

        # 这里从0到5意思是采用了tiled上的1到6
        # 肯定不会有6，因为不可能没有图，
        # 所以一定会出现hasNotation为false，此时增加一个所有的，key为0，意味着所有的restrict都会响应
        for x in xrange(0, MAX_R_TH):
            key = notationKeyRowFrom + x
            noRowList = []
            hasNotation = False
            restrict = 0
            for i in xrange(1, maxH, 3):
                noData = noList[i][0]
                if noData <= 0:
                    noRowList.append(1)
                elif noData < key:
                    noRowList.append(0)
                elif noData == key:
                    noRowList.append(0)
                    hasNotation = True
                    natationRestrict = noList[i + 1][0]
                    if natationRestrict > 0:
                        restrict = natationRestrict
                        if restrict != notationKey2Jump:
                            raise Exception("row restrict only use 2 jump key")
                else:
                    noRowList.append(1)

            if hasNotation:
                data = {}
                data["list"] = noRowList
                data["key"] = key
                data["restrict"] = restrict
                notationRow.append(data)

            else:
                for x in xrange(0, len(noRowList)):
                    noRowList[x] = 1

                restrict = noList[maxH][0]
                if restrict > 0 and restrict != notationKey2Jump:
                    raise Exception("row restrict only use 2 jump key")
                data = {}
                data["list"] = noRowList
                data["key"] = 0
                data["restrict"] = restrict
                notationRow.append(data)
                break

        return notationRow

    # 除去边缘
    def handleCoList(self, coList):
        newCoList = []
        for y in xrange(0, len(coList)):
            if y == len(coList) - 1:
                continue
            line = coList[y]
            newLine = []
            for x in xrange(0, len(line)):
                if x == 0:
                    continue
                data = line[x]
                newLine.append(data)
            newCoList.append(newLine)
        return newCoList

    # 检测spine，不能是强制移动类
    def checkSpine(self, coList):
        for line in coList:
            for tile in line:
                if tileMoveFrom <= tile and tile <= tileMoveTo:
                    raise Exception("wrong spine")

    def changeNotationListToNum(self, noList):
        k = 0
        for data in noList:
            k = k * 10 + data
        return k

    def getListCount(self, noList):
        k = 0
        for data in noList:
            if data == 1:
                k += 1
        return k

    def createEleList(self):
        elist = []
        for _ in xrange(0, MAX_R_TW):
            wList = []
            for _ in xrange(0, MAX_R_TH):
                hList = []
                for _ in xrange(0, MAX_DOOR_TYPE):
                    dList = [[], []]
                    hList.append(dList)
                wList.append(hList)
            elist.append(wList)

        return elist

    def removeList(self, dList, key):
        if not doorTypeList.has_key(key):
            raise Exception("wrong ele door key")

        if dList.has_key(key):
            del dList[key]

    def getEleDoorTypes(self, doorType):
        hasUp = len(doorType[0]) > 0
        hasDown = len(doorType[1]) > 0
        hasLeft = len(doorType[2]) > 0
        hasRight = len(doorType[3]) > 0

        dList = copy.deepcopy(doorTypeList)

        if not hasUp:
            self.removeList(dList, "top")

            self.removeList(dList, "lef_top")
            self.removeList(dList, "rig_top")
            self.removeList(dList, "top_bot")
            self.removeList(dList, "lef_top_rig")
            self.removeList(dList, "top_rig_bot")
            self.removeList(dList, "bot_lef_top")

            self.removeList(dList, "all")

        if not hasDown:
            self.removeList(dList, "bot")

            self.removeList(dList, "lef_bot")
            self.removeList(dList, "rig_bot")
            self.removeList(dList, "top_bot")
            self.removeList(dList, "top_rig_bot")
            self.removeList(dList, "rig_bot_lef")
            self.removeList(dList, "bot_lef_top")

            self.removeList(dList, "all")

        if not hasLeft:
            self.removeList(dList, "lef")

            self.removeList(dList, "lef_top")
            self.removeList(dList, "lef_bot")
            self.removeList(dList, "lef_rig")
            self.removeList(dList, "lef_top_rig")
            self.removeList(dList, "rig_bot_lef")
            self.removeList(dList, "bot_lef_top")

            self.removeList(dList, "all")

        if not hasRight:
            self.removeList(dList, "rig")

            self.removeList(dList, "rig_top")
            self.removeList(dList, "rig_bot")
            self.removeList(dList, "lef_rig")
            self.removeList(dList, "lef_top_rig")
            self.removeList(dList, "top_rig_bot")
            self.removeList(dList, "rig_bot_lef")

            self.removeList(dList, "all")

        numList = []
        for key in dList:
            n = dList[key]
            numList.append(n)
        return numList

    def setEleIntoList(self, ele, index):
        eleDoorTypes = self.getEleDoorTypes(ele["doorType"])

        if not self.eleLists:
            self.eleLists = self.createEleList()

        for t in eleDoorTypes:
            e = self.eleLists[ele["tW"] - 1][ele["tH"] - 1][t][index]
            e.append(len(self.eles) - 1)

    # 变成数组，减少数据量
    def getEleArray(self, ele):
        return [ele["bi"], ele["tW"], ele["tH"], ele["uTX"], ele["uTY"], ele["doorType"], ele["sp"]]

    def saveEle(self, outPath):

        data = {}
        data["bases"] = self.eleBases
        data["eles"] = self.eles
        data["list"] = self.eleLists

        jsonStr = json.dumps(data)
        jsStr = "module.exports = " + jsonStr + ";"
        saveFile(outPath, jsStr)


def createMap():
    creator = MapCreator()
    creator.createMap()


def createEle(x=None):
    creator = EleCreator()
    creator.createEle()


if '__main__' == __name__:

    if len(sys.argv) >= 2:
        if sys.argv[1] == "m":
            createMap()
        elif sys.argv[1] == "e":
            if len(sys.argv) >= 3:
                createEle(sys.argv[2])
            else:
                createEle()

    else:
        createMap()
        createEle()
