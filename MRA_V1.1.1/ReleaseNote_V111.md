# MRA Release note (V1.1.1)

2022.07.13

- Data version: 1.1.1
- Data format version: 1.1.0
- Appendix Release version: P (rev.1)

## Revision history

Data version | Date | Description
:---|:---|:---
1.0.0 | 2021.11.17 | Official release
1.0.1 | 2021.12.01 | MRA v1.0.0 から作成した device description の validation で見つかった不具合対応
1.1.0 | 2022.05.27 | Appendix Release version N, P, P (rev.1) 対応</br>8種類の機器追加</br>Release P英語版におけるTypo等の修正対応</br>
1.1.1 | 2022.07.13 | MRA v1.1.0 から作成した device description の validation で見つかった不具合対応 </br>


## MRA V1.1.1 変更内容

File | EPC | 変更内容
:-----|:-----------|:---
definitions.json | - | state_NoSetting_00内の"none"を"noSetting"へ変更 
0x0000.json | 0x8F | 記述の内容を修正
0x0272.json | 0xDA | shortNameを修正
0x027A.json | 0xD2 | shortNameを修正
0x0130_mcrule.json | 0x90, 0x94 | EPCのtypeを修正


# MRA Release note (V1.1.0)

2022.05.27

- Data version: 1.1.0
- Data format version: 1.1.0
- Appendix Release version: P (rev.1)

Release P  (rev.1) 対応。新たに数機種を追加する。

## Revision history

Data version | Date | Description
:---|:---|:---
1.0.0 | 2021.11.17 | Official release
1.0.1 | 2021.12.01 | MRA v1.0.0 から作成した device description の validation で見つかった不具合対応
1.1.0 | 2022.05.27 | Appendix Release version N, P, P (rev.1) 対応</br>8種類の機器追加</br>Release P英語版におけるTypo等の修正対応</br>

## 追加機器

今回追加公開する機器オブジェクトは以下の8機種です。

EOJ|機器名|Device name|
:-----------------------|:--------------------------------------|:-------|
0x0007|人体検知センサ|Human detection sensor
0x0012|湿度センサ|Humidity sensor
0x0016|風呂沸き上がりセンサ|Bath heating status sensor
0x001B|CO2センサ|CO2 sensor
0x0281|水流量メータ（MCRuleも追加）|Water flowmeter
0x0282|ガスメータ|Gas meter
0x028D|スマート電力量サブメータ（MCRuleも追加）|Smart electric energy meter for sub-metering
0x02A3|照明システム|Lighting system
## definitions の修正

- definitions に以下の項目を追加
  - number_1-999
  - number_1-999999
  - number_0-999999999m3
  - state_LightColor_40-44FD
  - state_NoData_FFFE
# MRA Release note (V1.0.1)

2022.01.07

- Data version: 1.0.1
- Data format version: 1.0.0
- Appendix Release version: M
## Revision history

Data version | Date | Description
:-----|:-----------|:---
1.0.0 | 2021.11.17 | Official release
1.0.1 | 2021.12.01 | MRA V1.0.0 から作成した DD の validation で見つかった不具合対応</br>その他マイナーな修正
## MRA V1.0.1 変更内容

File | EPC | 変更内容
:-----|:-----------|:---
0x027A_mcrule.json | 0xE7 | noteの記述の位置を修正
0x027A_mcrule.json | 0xE8 | noteの記述の位置を修正
0x027B_mcrule.json | 0xE7 | noteの記述の位置を修正
0x027B_mcrule.json | 0xE8 | noteの記述の位置を修正
0x0280_mcrule.json | 0xE0 | 記述追加 (\*1)
0x0280_mcrule.json | 0xE3 | 記述追加 (\*1)
0x03B9_mcrule.json | 0xE7 | 正しい DD が生成されるように、oneOf の記述を修正
0x0290.json        | 0xBB | shortName を lightColorForMainLighting に修正する
0x027A.json        | 0xE7 | note を remark に修正
0x027A.json        | 0xE8 | note を remark に修正
0x0288.json        | 0xE5 | definitions/state_DefaultValue_FF を参照するように修正（内容の変更は無し）
0x0602.json        | 0xB2 | bitmaps 内の name を Device Descriptions に合わせるように修正 (\*2)
definitions.json   |      | number_-999999999--1Wh の "format" の value を修正 (unit32->int32) (\*3)

(\*1)

```
"note" : {
  "ja" : "EPC=0xE2の値を乗算済みの値",
  "en" : "The value is multipled by the value of EPC=0xE2."
}
```

(\*2)

修正前 | 修正後
:-----|:-------
ansiX34 | ansiX34Equipped
shiftJis | shiftJisEquipped
jis | jisEquipped
japaneseEuc | japaneseEucEquipped
ucs4 | ucs4Equipped
ucs2 | ucs2Equipped
latin1 | latin1Equipped
utf8 | utf8Equipped

(\*3)

修正前

```json
    "number_-999999999--1Wh": {
      "type": "number",
      "format": "uint32",
      "minimum": -999999999,
      "maximum": -1,
      "unit": "Wh"
    },
```

修正後

```json
    "number_-999999999--1Wh": {
      "type": "number",
      "format": "int32",
      "minimum": -999999999,
      "maximum": -1,
      "unit": "Wh"
    },
```
# MRA Release note (V1.0.0)

2021.12.01

- Data version: 1.0.0
- Data format version: 1.0.0
- Appendix Release version: M

Guidebook of Machine Readable Appendix (MRA) V1.0.0 に準拠した、機器オブジェクト詳細規定のデータを公開します。

今回公開する機器オブジェクトは以下の38機種です。

EOJ|機器名|Device name|
:-----------------------|:--------------------------------------|:-------|
0x0011|温度センサ|Temperature sensor
0x0022|電力量センサ|Electric energy sensor
0x0023|電流量センサ| Current value sensor
0x0130|家庭用エアコン|Home air conditioner|
0x0133|換気扇|Ventilation fan|
0x0134|空調換気扇|Air conditioner ventilation fan
0x0135|空気清浄器|Air cleaner
0x0156|業務用パッケージエアコン室内機（設備用を除く）| Package-type commercial air conditioner (indoor unit)(except those for facilities)
0x0157|業務用パッケージエアコン室外機（設備用を除く）|Package-type commercial air conditioner (outdoor unit)(except those for facilities)
0x0263|電動雨戸・シャッター|Electrically operated rain sliding door/shutter
0x026B|電気温水器|Electric water heater|
0x026F|電気錠|Electric key|
0x0272|瞬間式給湯器|Instantaneous water heater|
0x0273|浴室暖房乾燥機|Bathroom heater & dryer|
0x0279|住宅用太陽光発電|Household solar power generation|
0x027A|冷温水熱源機|Hot water heat source equipment
0x027B|床暖房|Floor heater|
0x027C|燃料電池|Fuel cell|
0x027D|蓄電池|Storage battery|
0x027E|電気自動車充放電器|EV charger & discharger|
0x0280|電力量メータ|Watt-hour meter
0x0287|分電盤メータリング|Power distribution board|
0x0288|低圧スマート電力量メータ|Low-voltage smart electric energy meter|
0x028A|高圧スマート電力量メータ|High-voltage smart electric energy meter|
0x0290|一般照明|General lighting|
0x0291|単機能照明|Mono functional lighting|
0x02A1|電気自動車充電器|EV charger|
0x02A4|拡張照明システム|Extended lighting system
0x02A6|ハイブリッド給湯器|Hybrid water heater|
0x03B7|冷凍冷蔵庫|Refrigerator
0x03B9|クッキングヒータ|Cooking heater
0x03BB|炊飯器|Rice cooker
0x03CE|業務用ショーケース| Commercial show case
0x03D3|洗濯乾燥機|Washer & dryer|
0x03D4|業務用ショーケース向け室外機| Commercial show case outdoor unit
0x05FD|スイッチ|Switch
0x05FF|コントローラ|Controller
0x0602|テレビ|Television

- 機器オブジェクトスーパークラスに対応したデータは 0x0000.json に記述しています。
- ノードプロファイル (0x0EF0) に対応したデータは 0x0EF0.json に記述しています。なお、プロファイルオブジェクトスーパークラスの内容を含みます。
- 仕様変更に関する履歴情報は APPENDIX改訂履歴M_20211109.xls の記載内容を元に記述しています。電動⾬⼾・シャッター(0x0263)、燃料電池(0x027C)、電気⾃動⾞充放電器(0x027E)、低圧スマート電⼒量メータ(0x0288) に関しては、リリース毎の修正内容等を考慮して、それぞれ Release D, C, D, F 以降の履歴情報を記述しています。
- フォルダ MCRules 内のファイルは、ECHONET Lite Web API の Device Descriptions を⽣成する際に利⽤するものです。
