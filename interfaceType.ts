import { Converter, DefaultConverter, UnknownConverter } from "./echoNetLiteParser";

export type Type_common_protocol = {type:string,version:string};
export type Type_common_manufacturer = {code:string,descriptions:{ja:string,en:string}};
export type Type_homeAirConditioner_onTimerReservation = "timeOnRelativeTimeOn"|"timeOffRelativeTimeOff"|"timeOnRelativeTimeOff"|"timeOffRelativeTimeOn";
export type Type_homeAirConditioner_offTimerReservation = "timeBasedAndRelativeTimeBasedOn"|"bothOff"|"timeBasedOn"|"relativeTimeBasedOn";
export type Type_homeAirConditioner_airFlowLevel = Number|"auto";
export type Type_homeAirConditioner_automaticControlAirFlowDirection = "auto"|"nonAuto"|"autoVertical"|"autoHorizontal";
export type Type_homeAirConditioner_automaticSwingAirFlow = "off"|"vertical"|"holizontal"|"verticalAndHolizontal";
export type Type_homeAirConditioner_airFlowDirectionVertical = "uppermost"|"lowermost"|"central"|"upperCenter"|"lowerCenter";
export type Type_homeAirConditioner_airFlowDirectionHorizontal = "rc_r"|"l_lc"|"lc_c_rc"|"l_lc_rc_r"|"r"|"rc"|"c"|"c_r"|"c_rc"|"c_rc_r"|"lc"|"lc_r"|"lc_rc"|"lc_rc_r"|"lc_c"|"lc_c_r"|"lc_c_rc_r"|"l"|"l_r"|"l_rc"|"l_rc_r"|"l_c"|"l_c_r"|"l_c_rc"|"l_c_rc_r"|"l_lc_r"|"l_lc_rc"|"l_lc_c"|"l_lc_c_r"|"l_lc_c_rc"|"l_lc_c_rc_r";
export type Type_homeAirConditioner_specialState = "normal"|"defrosting"|"preheating"|"heatRemoval";
export type Type_homeAirConditioner_operationMode = "auto"|"cooling"|"heating"|"dehumidification"|"circulation"|"other";
export type Type_homeAirConditioner_automaticTemperatureControl = "auto"|"nonAuto";
export type Type_homeAirConditioner_highspeedOperation = "normal"|"highspeed"|"silent";
export type Type_homeAirConditioner_targetTemperature = Number|"undefined";
export type Type_homeAirConditioner_targetTemperatureCooling = Number|"undefined";
export type Type_homeAirConditioner_targetTemperatureHeating = Number|"undefined";
export type Type_homeAirConditioner_targetTemperatureDehumidifying = Number|"undefined";
export type Type_homeAirConditioner_ratedPowerConsumption = {cooling:Number|"unsupported",heating:Number|"unsupported",dehumidifying:Number|"unsupported",circulation:Number|"unsupported"};
export type Type_homeAirConditioner_humidity = Number|"unmeasurable";
export type Type_homeAirConditioner_roomTemperature = Number|"unmeasurable";
export type Type_homeAirConditioner_airFlowTemperature = Number|"unmeasurable";
export type Type_homeAirConditioner_outdoorTemperature = Number|"unmeasurable";
export type Type_homeAirConditioner_relativeTemperature = Number|"unmeasurable";
export type Type_homeAirConditioner_ventilationFunction = "onOutlet"|"off"|"onIntake"|"onOutletAndIntake";
export type Type_homeAirConditioner_ventilationAirFlowLevel = Number|"auto";
export type Type_homeAirConditioner_humidificationLevel = Number|"auto";
export type Type_homeAirConditioner_airCleaningMethod = {electronic:"no"|"yes",clusterIon:"no"|"yes"};
export type Type_homeAirConditioner_airPurifierFunction = {electronicLevel:Number,electronicMode:"off"|"on",electronicAuto:"nonAuto"|"auto",clusterIonLevel:Number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"};
export type Type_homeAirConditioner_airRefreshMethod = {minusIon:"no"|"yes",clusterIon:"no"|"yes"};
export type Type_homeAirConditioner_airRefresherFunction = {minusIonLevel:Number,minusIonMode:"off"|"on",minusIonAuto:"nonAuto"|"auto",clusterIonLevel:Number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"};
export type Type_homeAirConditioner_selfCleaningMethod = {ozone:"no"|"yes",drying:"no"|"yes"};
export type Type_homeAirConditioner_selfCleaningFunction = {ozoneLevel:Number,ozoneMode:"off"|"on",ozoneAuto:"nonAuto"|"auto",dryingLevel:Number,dryingMode:"off"|"on",dryingAuto:"nonAuto"|"auto"};
export type Type_homeAirConditioner_specialFunction = "noSetting"|"clothesDryer"|"condensationSuppressor"|"miteAndMoldControl"|"activeDefrosting";
export type Type_homeAirConditioner_componentsOperationStatus = {compressor:"off"|"on",thermostat:"off"|"on"};
export type Type_homeAirConditioner_thermostatOverride = "normal"|"on"|"off";
export type Type_instantaneousWaterHeater_tergetAutomaticOprationTime = string|"limitless";
export type Type_instantaneousWaterHeater_remainingAutomaticOperationTime = string|"limitless";
export type Type_instantaneousWaterHeater_bathOperationStatus = "runningHotWater"|"noOperation"|"keepingTemperature";
export type Type_fuelCell_powerGenerationSetting = "generationOn"|"generationOff";
export type Type_fuelCell_powerGenerationStatus = "generating"|"stopped"|"starting"|"stopping"|"idling";
export type Type_fuelCell_powerSystemInterconnectionStatus = "reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable";
export type Type_fuelCell_requestedTimeOfGeneration = {startTime:string,endTime:string}|"undefined";
export type Type_fuelCell_powerGenerationMode = "maximumRating"|"loadFollowing";
export type Type_storageBattery_acTargetChargingElectricEnergy = Number|"notSet";
export type Type_storageBattery_acTargetDischargingElectricEnergy = Number|"notSet";
export type Type_storageBattery_chargingMethod = "maximum"|"surplus"|"designatedPower"|"designatedCurrent"|"other";
export type Type_storageBattery_dischargingMethod = "maximum"|"loadFollowing"|"designatedPower"|"designatedCurrent"|"other";
export type Type_storageBattery_minimumAndMaximumChargingElectricPower = {minValue:Number,maxValue:Number};
export type Type_storageBattery_minimumAndMaximumDischargingElectricPower = {minValue:Number,maxValue:Number};
export type Type_storageBattery_minimumAndMaximumChargingCurrent = {minValue:Number,maxValue:Number};
export type Type_storageBattery_minimumAndMaximumDischargingCurrent = {minValue:Number,maxValue:Number};
export type Type_storageBattery_reInterconnectionPermission = "permitted"|"prohibited";
export type Type_storageBattery_operationPermission = "permitted"|"prohibited";
export type Type_storageBattery_independentOperationPermission = "permitted"|"prohibited";
export type Type_storageBattery_actualOperationMode = "rapidCharging"|"charging"|"discharging"|"standby"|"test"|"auto"|"restart"|"capacityRecalculation"|"other";
export type Type_storageBattery_operationMode = "rapidCharging"|"charging"|"discharging"|"standby"|"test"|"auto"|"restart"|"capacityRecalculation"|"other";
export type Type_storageBattery_powerSystemInterconnectionStatus = "reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable";
export type Type_storageBattery_minimumAndMaximumChargingPowerAtIndependent = {minValue:Number,maxValue:Number};
export type Type_storageBattery_minimumAndMaximumDischargingPowerAtIndependent = {minValue:Number,maxValue:Number};
export type Type_storageBattery_minimumAndMaximumChargingCurrentAtIndependent = {minValue:Number,maxValue:Number};
export type Type_storageBattery_minimumAndMaximumDischargingCurrentAtIndependent = {minValue:Number,maxValue:Number};
export type Type_storageBattery_chargingAndDischargingAmount1 = Number|Number;
export type Type_storageBattery_chargingAndDischargingAmount2 = Number|Number;
export type Type_storageBattery_batteryType = "unknown"|"lead"|"ni_mh"|"ni_cd"|"lib"|"zinc"|"alkaline";
export type Type_evChargerDischarger_chargeDischargeStatus = "undefined"|"notConnected"|"connected"|"chargeable"|"dischargeable"|"chargeableDischargeable"|"unknown";
export type Type_evChargerDischarger_minimumAndMaximumChargingElectricPower = {minimumElectricPower:Number,maximumElectricPower:Number};
export type Type_evChargerDischarger_minimumAndMaximumDischargingElectricPower = {minimumElectricPower:Number,maximumElectricPower:Number};
export type Type_evChargerDischarger_minimumAndMaximumChargingCurrent = {minimumCurrent:Number,maximumCurrent:Number};
export type Type_evChargerDischarger_minimumAndMaximumDischargingCurrent = {minimumCurrent:Number,maximumCurrent:Number};
export type Type_evChargerDischarger_equipmentType = "ac_cplt"|"ac_hlc_charge"|"ac_hlc_chargedischarge"|"dc_aa_charge"|"dc_aa_chargedischarge"|"dc_aa_discharge"|"dc_bb_charge"|"dc_bb_chargedischarge"|"dc_bb_discharge"|"dc_ee_charge"|"dc_ee_chargedischarge"|"dc_ee_discharge"|"dc_ff_charge"|"dc_ff_chargedDischarge"|"dc_ff_discharge";
export type Type_evChargerDischarger_operationMode = "charge"|"discharge"|"standby"|"idle"|"other";
export type Type_evChargerDischarger_powerSystemInterconnectionStatus = "reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable";
export type Type_lvSmartElectricEnergyMeter_normalDirectionCumulativeElectricEnergy = Number|"noData";
export type Type_lvSmartElectricEnergyMeter_normalDirectionCumulativeElectricEnergyLog1 = {day:Number|"defaultValue",electricEnergy:(Number|"noData")[]};
export type Type_lvSmartElectricEnergyMeter_reverseDirectionCumulativeElectricEnergy = Number|"noData";
export type Type_lvSmartElectricEnergyMeter_reverseDirectionCumulativeElectricEnergyLog1 = {day:Number|"defaultValue",electricEnergy:(Number|"noData")[]};
export type Type_lvSmartElectricEnergyMeter_instantaneousElectricPower = Number|"noData";
export type Type_lvSmartElectricEnergyMeter_instantaneousCurrent = {rPhase:Number|"noData",tPhase:Number|"noData"};
export type Type_lvSmartElectricEnergyMeter_normalDirectionCumulativeElectricEnergyAtEvery30Min = {dateAndTime:string,electricEnergy:Number|"noData"};
export type Type_lvSmartElectricEnergyMeter_reverseDirectionCumulativeElectricEnergyEvery30Min = {dateAndTime:string,electricEnergy:Number|"noData"};
export type Type_lvSmartElectricEnergyMeter_cumulativeElectricEnergyLog2 = {dateAndTime:string,numberOfCollectionSegments:Number,electricEnergy:({normalDirectionElectricEnergy:Number|"noData",reverseDirectionElectricEnergy:Number|"noData"})[]};
export type Type_hvSmartElectricEnergyMeter_monthlyMaximumElectricPowerDemand = Number|"noData";
export type Type_hvSmartElectricEnergyMeter_averageElectricPowerDemand = {dateAndTime:string,electricPower:Number|"noData"};
export type Type_hvSmartElectricEnergyMeter_electricPowerDemandLog = {day:Number|"defaultValue",electricPower:(Number|"noData")[]};
export type Type_hvSmartElectricEnergyMeter_cumulativeReactiveElectricEnergy = {dateAndTime:string,reactiveElectricEnergy:Number|"noData"};
export type Type_hvSmartElectricEnergyMeter_cumulativeReactiveElectricEnergyAtEvery30Min = {dateAndTime:string,reactiveElectricEnergy:Number|"noData"};
export type Type_hvSmartElectricEnergyMeter_cumulativeReactiveElectricEnergyLog = {day:Number|"defaultValue",reactiveElectricEnergy:(Number|"noData")[]};
export type Type_hvSmartElectricEnergyMeter_cumulativeActiveElectricEnergy = {dateAndTime:string,activeElectricEnergy:Number|"noData"};
export type Type_hvSmartElectricEnergyMeter_cumulativeActiveElectricEnergyAtEvery30Min = {dateAndTime:string,activeElectricEnergy:Number|"noData"};
export type Type_hvSmartElectricEnergyMeter_cumulativeActiveElectricEnergyForPowerFactor = {dateAndTime:string,electricEnergy:Number|"noData"};
export type Type_hvSmartElectricEnergyMeter_activeElectricEnergyLog = {day:Number|"defaultValue",activeElectricEnergy:(Number|"noData")[]};
export type Type_generalLighting_lightColor = "incandescent"|"white"|"daylightWhite"|"daylightColor"|"other";
export type Type_generalLighting_maximumSpecifiableLevel = {brightness:Number|"notBrightness",color:Number|"notColor"};
export type Type_generalLighting_maximumSettableLevelForNightLighting = {brightness:Number|"notBrightness",color:Number|"notColor"};
export type Type_generalLighting_operationMode = "auto"|"normal"|"night"|"color";
export type Type_generalLighting_brightnessLevelStepForNightLighting = "incandescent"|"white"|"daylightWhite"|"daylightColor"|"other";
export type Type_generalLighting_lightColorLevelForNightLighting = "incandescent"|"white"|"daylightWhite"|"daylightColor"|"other";
export type Type_generalLighting_autoMode = "normal"|"night"|"off"|"color";
export type Type_generalLighting_rgb = {red:Number,green:Number,blue:Number};
export type Type_evCharger_chargeStatus = "undefined"|"notConnected"|"notChargeable"|"chargeable"|"unknown";
export type Type_evCharger_minimumAndMaximumChargingElectricPower = {minimumElectricPower:Number,maximumElectricPower:Number};
export type Type_evCharger_minimumAndMaximumChargingCurrent = {minimumCurrent:Number,maximumCurrent:Number};
export type Type_evCharger_equipmentType = "ac_cplt"|"ac_hlc_charge"|"dc_aa_charge"|"dc_bb_charge"|"dc_ee_charge"|"dc_ff_charge";
export type Type_evCharger_operationMode = "charge"|"standby"|"idle"|"other";
export type Type_evCharger_vehicleId = {dataSize:Number,id:string};
export type Type_enhancedLightingSystem_sceneId = Number|"notSet";
export type Type_enhancedLightingSystem_powerConsumptionRateList = (Number|"unknown")[];
export type Type_enhancedLightingSystem_powerConsumptionLimit = Number|"cancel";
export type Type_controller_deviceList = ({deviceId:string,deviceType:string,connection:"connected"|"disconnected"|"notRegistered"|"deleted",manufactureCode:string})[];
export type Type_ventilationFan_airFlowLevel = Number|"auto";
export type Type_airCleaner_airFlowLevel = Number|"auto";
export type Type_commercialAirConditionerIndoorUnit_automaticOperationModeStatus = "cooling"|"heating"|"dehumidification"|"circulation"|"other";
export type Type_commercialAirConditionerIndoorUnit_operationMode = "auto"|"cooling"|"heating"|"dehumidification"|"circulation";
export type Type_commercialAirConditionerIndoorUnit_roomTemperature = Number|"unmeasurable";
export type Type_commercialAirConditionerIndoorUnit_groupInformation = Number|"none";
export type Type_commercialAirConditionerIndoorUnit_powerConsumption = "less50W"|"less100W"|"less150W"|"less200W"|"200WOrMore"|"undefined";
export type Type_commercialAirConditionerIndoorUnit_groupDeviceList = ({deviceId:string,deviceType:string})[];
export type Type_commercialAirConditionerOutdoorUnit_ratedPowerConsumption = {cooling:Number|"unsupported",heating:Number|"unsupported"};
export type Type_commercialAirConditionerOutdoorUnit_outdoorTemperature = Number|"unmeasurable";
export type Type_commercialAirConditionerOutdoorUnit_groupInformation = Number|"none";
export type Type_commercialAirConditionerOutdoorUnit_powerConsumptionLimit = Number|"canceling";
export type Type_commercialAirConditionerOutdoorUnit_groupDeviceList = ({deviceId:string,deviceType:string})[];
export type Type_electricRainDoor_faultDescription = "obstacleCaught"|"outageRecovery"|"timeOut"|"batteryLow";
export type Type_electricRainDoor_openingSpeed = "low"|"medium"|"high";
export type Type_electricRainDoor_closingSpeed = "low"|"medium"|"high";
export type Type_electricRainDoor_openCloseOperation = "open"|"close"|"stop";
export type Type_electricRainDoor_openCloseSpeed = "low"|"medium"|"high";
export type Type_electricRainDoor_selectiveDegreeOfOpening = "degreeOfOpening"|"operationTimeOfOpening"|"operationTimeOfClosing"|"localSetting"|"slitDegreeOfOpening";
export type Type_electricRainDoor_openCloseStatus = "fullyOpen"|"fullyClosed"|"opening"|"closing"|"stoppedHalfway";
export type Type_electricRainDoor_oneTimeOpeningSpeed = "low"|"medium"|"high"|"none";
export type Type_electricRainDoor_oneTimeClosingSpeed = "low"|"medium"|"high"|"none";
export type Type_electricWaterHeater_automaticWaterHeating = "auto"|"manualNoHeating"|"manualHeating";
export type Type_electricWaterHeater_targetWaterHeatingTemperature = Number|"undefined";
export type Type_electricWaterHeater_heatingStopDays = Number|"infinite";
export type Type_electricWaterHeater_tankOperationMode = "standard"|"saving"|"extra";
export type Type_electricWaterHeater_alarmStatus = {noHotWater:boolean,leaking:boolean,freezing:boolean};
export type Type_electricWaterHeater_waterHeatingShiftTime1 = string|"cleared";
export type Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime1 = {at1000:Number,at1300:Number,at1500:Number,at1700:Number};
export type Type_electricWaterHeater_electricEnergyConsumptionRate1 = {at1000:Number,at1300:Number,at1500:Number,at1700:Number};
export type Type_electricWaterHeater_waterHeatingShiftTime2 = string|"cleared";
export type Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime2 = {at1300:Number,at1500:Number,at1700:Number};
export type Type_electricWaterHeater_electricEnergyConsumptionRate2 = {at1300:Number,at1500:Number,at1700:Number};
export type Type_electricWaterHeater_surplusPowerPrediction = {startDateAndTime:string,surplusEnergyPredictionValue:(Number|"invalid")[]};
export type Type_electricWaterHeater_bathOperationStatusMonitor = "runningHotWater"|"noOperation"|"keepingTemperature";
export type Type_electricLock_alarmStatus = "normal"|"breakOpen"|"doorOpen"|"manualUnlocked"|"tampered";
export type Type_bathroomHeaterDryer_operationSetting = "ventilation"|"prewarming"|"heating"|"drying"|"circulation"|"mistSauna"|"waterMist"|"stop";
export type Type_bathroomHeaterDryer_ventilationSetting = Number|"auto"|"standard";
export type Type_bathroomHeaterDryer_bathroomPrewarming = Number|"auto"|"standard";
export type Type_bathroomHeaterDryer_bathroomHeating = Number|"auto"|"standard";
export type Type_bathroomHeaterDryer_bathroomDrying = Number|"auto"|"standard";
export type Type_bathroomHeaterDryer_coolAirCirculation = Number|"auto"|"standard";
export type Type_bathroomHeaterDryer_mistSauna = Number|"auto"|"standard";
export type Type_bathroomHeaterDryer_waterMist = Number|"auto"|"standard";
export type Type_bathroomHeaterDryer_ventilationAirFlowLevel = Number|"auto";
export type Type_bathroomHeaterDryer_onTimerReservation2 = "ventilationReservation"|"prewarmingReservation"|"heatingReservation"|"dryingReservation"|"circulationReservation"|"mistSaunaReservation"|"waterMistReservation"|"noReservation";
export type Type_pvPowerGeneration_outputPowerControlSchedule = {startDateAndTime:string|"unknown",intervalTime:Number,powerControlRatio:(Number|"undefined")[]};
export type Type_pvPowerGeneration_updateScheduleDateAndTime = string|"noControlNoSchedule";
export type Type_pvPowerGeneration_contractType = "fit"|"non_fit"|"undefined";
export type Type_pvPowerGeneration_selfConsumptionType = "withSelfConsumption"|"withoutSelfConsumption"|"unknown";
export type Type_pvPowerGeneration_powerSystemInterconnectionStatus = "reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable"|"unknown";
export type Type_pvPowerGeneration_outputPowerRestraintStatus = "outputControl"|"exceptControl"|"reasonUnknown"|"notPowerRestraint"|"unknown";
export type Type_floorHeater_targetTemperature1 = Number|"auto";
export type Type_floorHeater_targetTemperature2 = Number|"auto";
export type Type_floorHeater_measuredRoomTemperature = Number|"undefine";
export type Type_floorHeater_measuredFloorTemperature = Number|"undefine";
export type Type_floorHeater_controllableZone = (boolean)[];
export type Type_floorHeater_specialOperationMode = "normal"|"modest"|"highPower";
export type Type_floorHeater_dailyTimer = "off"|"timer1"|"timer2";
export type Type_floorHeater_workedDailyTimer1 = ({startTime:string,endTime:string})[];
export type Type_floorHeater_workedDailyTimer2 = ({startTime:string,endTime:string})[];
export type Type_floorHeater_powerMeasurementMethod = "node"|"class"|"instance";
export type Type_refrigerator_quickFreeze = "normal"|"quick"|"standby";
export type Type_refrigerator_quickRefrigeration = "normal"|"quick"|"standby";
export type Type_refrigerator_icemaker = "enable"|"disable"|"standby";
export type Type_refrigerator_icemakerStatus = "running"|"stopped";
export type Type_refrigerator_icemakerTankStatus = "normal"|"warning";
export type Type_refrigerator_doorOpenCloseStatus = "anyOpen"|"allClose";
export type Type_refrigerator_refrigeratorCompartmentDoorStatus = "open"|"close";
export type Type_refrigerator_freezerCompartmentDoorStatus = "open"|"close";
export type Type_refrigerator_iceCompartmentDoorStatus = "open"|"close";
export type Type_refrigerator_vegetableCompartmentDoorStatus = "open"|"close";
export type Type_refrigerator_multiModeCompartmentDoorStatus = "open"|"close";
export type Type_refrigerator_compressorRotationSpeed = {maximumRotationSpeed:Number,rotationSpeed:Number};
export type Type_refrigerator_maximumAllowableTemperatureLevel = {refrigeratorCompartmentLevel:Number,freezerCompartmentLevel:Number,iceCompartmentLevel:Number,vegetableCompartmentLevel:Number,multiModeCompartmentLevel:Number};
export type Type_cookingHeater_relativeTimeOfOffTimers = {leftStove:string|"noSetting",rightStove:string|"noSetting",farSideStove:string|"noSetting",roaster:string|"noSetting"};
export type Type_cookingHeater_heatingStatus = {leftStove:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown",rightStove:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown",farSideStove:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown",roaster:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown"};
export type Type_cookingHeater_heatingOperation = {leftStove:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting",rightStove:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting",farSideStove:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting",roaster:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting"};
export type Type_cookingHeater_heatingModesOfStoves = {leftStove:"heatingPowerControl"|"deepFryingMode"|"waterHeating"|"riceBoiling"|"stirFrying"|"noSetting",rightStove:"heatingPowerControl"|"deepFryingMode"|"waterHeating"|"riceBoiling"|"stirFrying"|"noSetting",farSideStove:"heatingPowerControl"|"deepFryingMode"|"waterHeating"|"riceBoiling"|"stirFrying"|"noSetting"};
export type Type_cookingHeater_heatingTemperature = {leftStove:Number|"noSetting",rightStove:Number|"noSetting",farSideStove:Number|"noSetting"};
export type Type_riceCooker_coverStatus = "open"|"close";
export type Type_riceCooker_cookingStatus = "stop"|"preheating"|"cooking"|"steaming"|"completion";
export type Type_riceCooker_cookingControl = "running"|"suspension";
export type Type_commercialShowcase_operationMode = "cooling"|"nonCooling"|"defrosting"|"other";
export type Type_commercialShowcase_groupInformation = Number|"none";
export type Type_commercialShowcase_showcaseType = "nonFluorocarbonInverter"|"inverter"|"other";
export type Type_commercialShowcase_doorType = "open"|"closed";
export type Type_commercialShowcase_refrigeratorType = "separate"|"builtIn";
export type Type_commercialShowcase_shapeType = "box"|"desktop"|"tripleGlass"|"quadrupleQuintupleGlass"|"reachIn"|"glassTop"|"multistageOpenAndCeilingBlowoff"|"multistageOpenAndBacksideBlowoff"|"flat"|"walkIn"|"other";
export type Type_commercialShowcase_purposeType = "refrigeration"|"freezing";
export type Type_commercialShowcase_insideLightingType = "fluorescent"|"led"|"noLighting"|"other";
export type Type_commercialShowcase_outsideLightingType = "fluorescent"|"led"|"noLighting"|"other";
export type Type_commercialShowcase_groupDeviceList = ({deviceId:string,deviceType:string})[];
export type Type_commercialShowcaseOutdoorUnit_operationMode = "cooling"|"nonCooling";
export type Type_commercialShowcaseOutdoorUnit_groupInformation = Number|"none";
export type Type_commercialShowcaseOutdoorUnit_groupDeviceList = ({deviceId:string,deviceType:string})[];
export type Type_hybridWaterHeater_automaticWaterHeating = "auto"|"manualNotHeating"|"manualHeating";
export type Type_hybridWaterHeater_linkageModeForSolarPowerGeneration = "modeOff"|"householdConsumption"|"prioritizingElectricitySales"|"economicEfficiency";
export type Type_hybridWaterHeater_solarPowerGenerationsUtilizationTime = {startTime:string,endTime:string};
export type Type_washerDryer_onTimerReservationStatus = "enable"|"disable";
export type Type_washerDryer_doorOpenStatus = "open"|"close";
export type Type_washerDryer_runningStatus = "run"|"pause"|"stop";
export type Type_washerDryer_washerDryerCycle1 = "washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryIroning"|"washDryHangDrying"|"washDryThick"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washStandard"|"washSilent"|"washHeavilySoiled"|"washHardToRemove"|"washPresoaking"|"washBlankets"|"washSoft"|"washDrymark"|"washCleanRinsing"|"washDisinfection"|"washOilStrains"|"washMemory"|"washDetergentSaving"|"washLightlySoiled"|"washSmallAmountQuick"|"washTankCleaning"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryTankDrying";
export type Type_washerDryer_washerDryerCycle2 = "washDryNoWash"|"washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washDryTankCleaning";
export type Type_washerDryer_dryerCycle = "dryNoDrying"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryHeaterCurrentLimit"|"dryTankDrying";
export type Type_washerDryer_washerDryerCycleOptions1 = ("washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryIroning"|"washDryHangDrying"|"washDryThick"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washStandard"|"washSilent"|"washHeavilySoiled"|"washHardToRemove"|"washPresoaking"|"washBlankets"|"washSoft"|"washDrymark"|"washCleanRinsing"|"washDisinfection"|"washOilStrains"|"washMemory"|"washDetergentSaving"|"washLightlySoiled"|"washSmallAmountQuick"|"washTankCleaning"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryTankDrying")[];
export type Type_washerDryer_washerDryerCycleOptions2 = ("washDryNoWash"|"washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washDryTankCleaning")[];
export type Type_washerDryer_washerDryerCycleOptions3 = ("dryNoDrying"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryHeaterCurrentLimit"|"dryTankDrying")[];
export type Type_washerDryer_waterFlowRate = {absolute:Number}|{relative:Number};
export type Type_washerDryer_spinDryingRotationSpeed = {absolute:Number}|{relative:Number};
export type Type_washerDryer_dryingDegree = {absolute:Number}|{relative:Number};
export type Type_washerDryer_washingTimeRemaining = Number|"unknown";
export type Type_washerDryer_dryingTimeRemaining = Number|"unknown";
export type Type_washerDryer_presoakingTime = {absolute:Number}|{relative:Number};
export type Type_washerDryer_currentStage = "washing"|"rinsing"|"spinDrying"|"suspended"|"washingCompleted"|"washingDryingCompleted"|"drying"|"wrinkleMinimizing"|"dryingWrinkleMinimizingCompleted"|"standby"|"1stRinsing"|"2ndRinsing"|"3rdRinsing"|"4thRinsing"|"5thRinsing"|"6thRinsing"|"7thRinsing"|"8thRinsing"|"1stSpinDrying"|"2ndSpinDrying"|"3rdSpinDrying"|"4thSpinDrying"|"5thSpinDrying"|"6thSpinDrying"|"7thSpinDrying"|"8thSpinDrying"|"preheatSpinDrying";
export type Type_washerDryer_waterVolumeByLiter = {absolute:Number}|{relative:Number};
export type Type_washerDryer_waterVolumeByStep = {absolute:Number}|{relative:Number};
export type Type_washerDryer_washingTime = {absolute:Number}|{relative:Number};
export type Type_washerDryer_rinsingCount = Number|"auto";
export type Type_washerDryer_rinsingProcess = ("auto"|"withoutAdditionalWater"|"withAdditionalWater"|"shower")[];
export type Type_washerDryer_spinDryingTime = {absolute:Number}|{relative:Number};
export type Type_washerDryer_dryingTime = {absolute:Number}|{relative:Number};
export type Type_washerDryer_waterTemperature = Number|"noWarmWater"|"auto";
export type Type_washerDryer_bathtubWaterRecycle = "none"|"washing"|"rinsingWithoutFinal"|"rinsing"|"washingRinsingWithoutFinal"|"washingRinsing";
export type Type_washerDryer_wrinklingMinimization = "enable"|"disable";
export type Type_washerDryer_washingDryingTimeRemaining = Number|"unknown";
export type Type_electricEnergySensor_log = (Number|"noData")[];
export type Type_airConditionerVentilationFan_airFlowLevel = Number|"auto";
export type Type_airConditionerVentilationFan_ventilationMethod = "blowing"|"airConditioning";
export type Type_airConditionerVentilationFan_ventilationMode = "normal"|"heatExchange"|"cooling"|"heating"|"dehumidifying"|"humidifying"|"other";
export type Type_airConditionerVentilationFan_returnAirTemperature = (Number|"unmeasurable")[];
export type Type_airConditionerVentilationFan_returnAirHumidity = (Number|"undefined")[];
export type Type_coldOrHotWaterHeatSourceEquipment_operationMode = "heating"|"cooling";
export type Type_coldOrHotWaterHeatSourceEquipment_waterTemperature1 = Number|"auto";
export type Type_coldOrHotWaterHeatSourceEquipment_waterTemperature2 = Number|Number|"auto";
export type Type_coldOrHotWaterHeatSourceEquipment_outwardWaterTemperatureExit = Number|"undefined";
export type Type_coldOrHotWaterHeatSourceEquipment_inwardWaterTemperatureEntrance = Number|"undefined";
export type Type_coldOrHotWaterHeatSourceEquipment_specialOperation = "normal"|"modest"|"highPower";
export type Type_coldOrHotWaterHeatSourceEquipment_dailyTimer = "timerMode"|"timer1"|"timer2";
export type Type_coldOrHotWaterHeatSourceEquipment_ratedPowerconsumption = {heating:Number,cooling:Number};
export type Type_coldOrHotWaterHeatSourceEquipment_powerConsumptionMeasurementMethod = "nodeUnit"|"classUnit"|"instanceUnit";
export type Type_wattHourMeter_cumulativeElectricEnergyLog1 = (Number|"noData")[];
export type Type_powerDistributionBoardMetering_numberOfMeasurementChannelsSimplex = Number|"undefined";
export type Type_powerDistributionBoardMetering_cumulativeElectricEnergyListSimplex = {startChannel:Number|"undefined",range:Number|"undefined",electricEnergy:(Number|"noData")[]};
export type Type_powerDistributionBoardMetering_instantaneousCurrentListSimplex = {startChannel:Number|"undefined",range:Number|"undefined",instantaneousCurrent:({rPhase:Number|"noData",tPhase:Number|"noData"})[]};
export type Type_powerDistributionBoardMetering_instantaneousElectricPowerListSimplex = {startChannel:Number|"undefined",range:Number|"undefined",instantaneousElectricPower:(Number|"noData")[]};
export type Type_powerDistributionBoardMetering_numberOfMeasurementChannelsDuplex = Number|"undefined";
export type Type_powerDistributionBoardMetering_cumulativeElectricEnergyListDuplex = {startChannel:Number|"undefined",range:Number|"undefined",electricEnergy:({normalDirectionElectricEnergy:Number|"noData",reverseDirectionElectricEnergy:Number|"noData"})[]};
export type Type_powerDistributionBoardMetering_instantaneousCurrentListDuplex = {startChannel:Number|"undefined",range:Number|"undefined",instantaneousCurrent:({rPhase:Number|"noData",tPhase:Number|"noData"})[]};
export type Type_powerDistributionBoardMetering_instantaneousElectricPowerListDuplex = {startChannel:Number|"undefined",range:Number|"undefined",instantaneousElectricPower:(Number|"noData")[]};
export type Type_powerDistributionBoardMetering_normalDirectionCumulativeElectricEnergy = Number|"noData";
export type Type_powerDistributionBoardMetering_reverseDirectionCumulativeElectricEnergy = Number|"noData";
export type Type_powerDistributionBoardMetering_normalDirectionCumulativeElectricEnergyLog = {day:Number|"defaultValue",electricEnergy:(Number|"noData")[]};
export type Type_powerDistributionBoardMetering_reverseDirectionCumulativeElectricEnergyLog = {day:Number|"defaultValue",electricEnergy:(Number|"noData")[]};
export type Type_powerDistributionBoardMetering_instantaneousElectricPower = Number|"noData";
export type Type_powerDistributionBoardMetering_instantaneousCurrent = {rPhase:Number|"noData",tPhase:Number|"noData"};
export type Type_powerDistributionBoardMetering_instantaneousVoltage = {rS:Number,sT:Number};
export type Type_powerDistributionBoardMetering_measurementChannel1 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel2 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel3 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel4 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel5 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel6 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel7 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel8 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel9 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel10 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel11 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel12 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel13 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel14 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel15 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel16 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel17 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel18 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel19 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel20 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel21 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel22 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel23 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel24 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel25 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel26 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel27 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel28 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel29 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel30 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel31 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_powerDistributionBoardMetering_measurementChannel32 = {electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"};
export type Type_tv_displayControlStatus = "enabled"|"disabled";
export type Type_tv_stringSettingAcceptanceStatus = "ready"|"busy";
export type Type_tv_supportedCharacterCode = {ansi_x3_4:"notImplemented"|"implemented",shift_jis:"notImplemented"|"implemented",jis:"notImplemented"|"implemented",japanese_euc:"notImplemented"|"implemented",ucs_4:"notImplemented"|"implemented",ucs_2:"notImplemented"|"implemented",latin_1:"notImplemented"|"implemented",utf_8:"notImplemented"|"implemented"};
export type Type_tv_characterStringPresented = {length:Number,characterCode:{ansi_x3_4:"notImplemented"|"implemented",shift_jis:"notImplemented"|"implemented",jis:"notImplemented"|"implemented",japanese_euc:"notImplemented"|"implemented",ucs_4:"notImplemented"|"implemented",ucs_2:"notImplemented"|"implemented",latin_1:"notImplemented"|"implemented",utf_8:"notImplemented"|"implemented"}};
export type Type_tv_lengthOfStringAccepted = {length:Number};

// 共通項目
export interface commonConverterType {
  operationStatus:Converter<boolean>;
  installationLocation:Converter<string>;
  protocol:Converter<Type_common_protocol>;
  id:Converter<string>;
  instantaneousElectricPowerConsumption:Converter<Number>;
  cumulativeElectricEnergy:Converter<Number>;
  manufacturerFaultCode:Converter<string>;
  currentLimit:Converter<Number>;
  faultStatus:Converter<boolean>;
  faultDescription:Converter<string>;
  manufacturer:Converter<Type_common_manufacturer>;
  businessFacilityCode:Converter<string>;
  productCode:Converter<string>;
  serialNumber:Converter<string>;
  productionDate:Converter<string>;
  powerSaving:Converter<boolean>;
  currentDateAndTime:Converter<string>;
  powerLimit:Converter<Number>;
  hourMeter:Converter<Number>;
}
// 家庭用エアコン eoj:0x0130
export interface homeAirConditionerConverterType {
  onTimerReservation:Converter<Type_homeAirConditioner_onTimerReservation>;
  onTime:Converter<string>;
  relativeOnTime:Converter<string>;
  offTimerReservation:Converter<Type_homeAirConditioner_offTimerReservation>;
  offTime:Converter<string>;
  relativeOffTime:Converter<string>;
  airFlowLevel:Converter<Type_homeAirConditioner_airFlowLevel>;
  automaticControlAirFlowDirection:Converter<Type_homeAirConditioner_automaticControlAirFlowDirection>;
  automaticSwingAirFlow:Converter<Type_homeAirConditioner_automaticSwingAirFlow>;
  airFlowDirectionVertical:Converter<Type_homeAirConditioner_airFlowDirectionVertical>;
  airFlowDirectionHorizontal:Converter<Type_homeAirConditioner_airFlowDirectionHorizontal>;
  specialState:Converter<Type_homeAirConditioner_specialState>;
  nonPriorityState:Converter<boolean>;
  operationMode:Converter<Type_homeAirConditioner_operationMode>;
  automaticTemperatureControl:Converter<Type_homeAirConditioner_automaticTemperatureControl>;
  highspeedOperation:Converter<Type_homeAirConditioner_highspeedOperation>;
  targetTemperature:Converter<Type_homeAirConditioner_targetTemperature>;
  relativeHumidityDehumidifying:Converter<Number>;
  targetTemperatureCooling:Converter<Type_homeAirConditioner_targetTemperatureCooling>;
  targetTemperatureHeating:Converter<Type_homeAirConditioner_targetTemperatureHeating>;
  targetTemperatureDehumidifying:Converter<Type_homeAirConditioner_targetTemperatureDehumidifying>;
  ratedPowerConsumption:Converter<Type_homeAirConditioner_ratedPowerConsumption>;
  currentConsumption:Converter<Number>;
  humidity:Converter<Type_homeAirConditioner_humidity>;
  roomTemperature:Converter<Type_homeAirConditioner_roomTemperature>;
  temperatureUserRemoteControl:Converter<Number>;
  airFlowTemperature:Converter<Type_homeAirConditioner_airFlowTemperature>;
  outdoorTemperature:Converter<Type_homeAirConditioner_outdoorTemperature>;
  relativeTemperature:Converter<Type_homeAirConditioner_relativeTemperature>;
  ventilationFunction:Converter<Type_homeAirConditioner_ventilationFunction>;
  humidifierFunction:Converter<"on"|"off">;
  ventilationAirFlowLevel:Converter<Type_homeAirConditioner_ventilationAirFlowLevel>;
  humidificationLevel:Converter<Type_homeAirConditioner_humidificationLevel>;
  airCleaningMethod:Converter<Type_homeAirConditioner_airCleaningMethod>;
  airPurifierFunction:Converter<Type_homeAirConditioner_airPurifierFunction>;
  airRefreshMethod:Converter<Type_homeAirConditioner_airRefreshMethod>;
  airRefresherFunction:Converter<Type_homeAirConditioner_airRefresherFunction>;
  selfCleaningMethod:Converter<Type_homeAirConditioner_selfCleaningMethod>;
  selfCleaningFunction:Converter<Type_homeAirConditioner_selfCleaningFunction>;
  specialFunction:Converter<Type_homeAirConditioner_specialFunction>;
  componentsOperationStatus:Converter<Type_homeAirConditioner_componentsOperationStatus>;
  thermostatOverride:Converter<Type_homeAirConditioner_thermostatOverride>;
  airPurification:Converter<"on"|"off">;
}
// 瞬間式給湯器 eoj:0x0272
export interface instantaneousWaterHeaterConverterType {
  onTimerReservation:Converter<boolean>;
  onTimerTime:Converter<string>;
  onTimerRelativeTimeSettingValue:Converter<string>;
  hotWaterHeatingStatus:Converter<boolean>;
  targetSuppliedWaterTemperature:Converter<Number>;
  hotWaterWarmerSetting:Converter<boolean>;
  bathWaterVolume4:Converter<Number>;
  maximumAllowableWaterVolume4:Converter<Number>;
  volume:Converter<Number>;
  mute:Converter<boolean>;
  tergetAutomaticOprationTime:Converter<Type_instantaneousWaterHeater_tergetAutomaticOprationTime>;
  remainingAutomaticOperationTime:Converter<Type_instantaneousWaterHeater_remainingAutomaticOperationTime>;
  targetBathWaterTemperature:Converter<Number>;
  bathWaterHeatingStatus:Converter<boolean>;
  automaticBathOperation:Converter<boolean>;
  tergetBathAdditionalBoilupOperation:Converter<boolean>;
  bathHotWaterAddition:Converter<boolean>;
  bathLukewarmWaterFunction:Converter<boolean>;
  bathWaterVolume1:Converter<Number>;
  bathWaterVolume2:Converter<Number>;
  bathroomPriority:Converter<boolean>;
  showerHotWaterSupplyStatus:Converter<boolean>;
  kitchenHotWaterSupplyStatus:Converter<boolean>;
  hotWaterWarmerONTimerReservationSetting:Converter<boolean>;
  tergetHotWaterWarmerONTimerTime:Converter<string>;
  bathWaterVolume3:Converter<Number>;
  bathOperationStatus:Converter<Type_instantaneousWaterHeater_bathOperationStatus>;
}
// 燃料電池 eoj:0x027C
export interface fuelCellConverterType {
  waterTemperatureInWaterHeater:Converter<Number>;
  ratedElectricPowerOfGeneration:Converter<Number>;
  heatCapacityOfStorageTank:Converter<Number>;
  instantaneousElectricPowerOfGeneration:Converter<Number>;
  cumulativeElectricEnergyOfGeneration:Converter<Number>;
  instantaneousGasConsumption:Converter<Number>;
  cumulativeGasConsumption:Converter<Number>;
  powerGenerationSetting:Converter<Type_fuelCell_powerGenerationSetting>;
  powerGenerationStatus:Converter<Type_fuelCell_powerGenerationStatus>;
  inHouseInstantaneousPowerConsumption:Converter<Number>;
  inHouseCumulativePowerConsumption:Converter<Number>;
  powerSystemInterconnectionStatus:Converter<Type_fuelCell_powerSystemInterconnectionStatus>;
  requestedTimeOfGeneration:Converter<Type_fuelCell_requestedTimeOfGeneration>;
  powerGenerationMode:Converter<Type_fuelCell_powerGenerationMode>;
  remainingHotWaterAmount:Converter<Number>;
  tankCapacity:Converter<Number>;
}
// 蓄電池 eoj:0x027D
export interface storageBatteryConverterType {
  acEffectiveChargingCapacity:Converter<Number>;
  acEffectiveDischargingCapacity:Converter<Number>;
  acChargeableCapacity:Converter<Number>;
  acDischargeableCapacity:Converter<Number>;
  acChargeableElectricEnergy:Converter<Number>;
  acDischargeableElectricEnergy:Converter<Number>;
  acChargeUpperLimit:Converter<Number>;
  acDischargeLowerLimit:Converter<Number>;
  acCumulativeChargingElectricEnergy:Converter<Number>;
  acCumulativeDischargingElectricEnergy:Converter<Number>;
  acTargetChargingElectricEnergy:Converter<Type_storageBattery_acTargetChargingElectricEnergy>;
  acTargetDischargingElectricEnergy:Converter<Type_storageBattery_acTargetDischargingElectricEnergy>;
  chargingMethod:Converter<Type_storageBattery_chargingMethod>;
  dischargingMethod:Converter<Type_storageBattery_dischargingMethod>;
  acRatedElectricEnergy:Converter<Number>;
  minimumAndMaximumChargingElectricPower:Converter<Type_storageBattery_minimumAndMaximumChargingElectricPower>;
  minimumAndMaximumDischargingElectricPower:Converter<Type_storageBattery_minimumAndMaximumDischargingElectricPower>;
  minimumAndMaximumChargingCurrent:Converter<Type_storageBattery_minimumAndMaximumChargingCurrent>;
  minimumAndMaximumDischargingCurrent:Converter<Type_storageBattery_minimumAndMaximumDischargingCurrent>;
  reInterconnectionPermission:Converter<Type_storageBattery_reInterconnectionPermission>;
  operationPermission:Converter<Type_storageBattery_operationPermission>;
  independentOperationPermission:Converter<Type_storageBattery_independentOperationPermission>;
  actualOperationMode:Converter<Type_storageBattery_actualOperationMode>;
  ratedElectricEnergy:Converter<Number>;
  ratedCapacity:Converter<Number>;
  ratedVoltage:Converter<Number>;
  instantaneousChargingAndDischargingElectricPower:Converter<Number>;
  instantaneousChargingAndDischargingCurrent:Converter<Number>;
  instantaneousChargingAndDischargingVoltage:Converter<Number>;
  cumulativeDischargingElectricEnergy:Converter<Number>;
  cumulativeChargingElectricEnergy:Converter<Number>;
  operationMode:Converter<Type_storageBattery_operationMode>;
  powerSystemInterconnectionStatus:Converter<Type_storageBattery_powerSystemInterconnectionStatus>;
  minimumAndMaximumChargingPowerAtIndependent:Converter<Type_storageBattery_minimumAndMaximumChargingPowerAtIndependent>;
  minimumAndMaximumDischargingPowerAtIndependent:Converter<Type_storageBattery_minimumAndMaximumDischargingPowerAtIndependent>;
  minimumAndMaximumChargingCurrentAtIndependent:Converter<Type_storageBattery_minimumAndMaximumChargingCurrentAtIndependent>;
  minimumAndMaximumDischargingCurrentAtIndependent:Converter<Type_storageBattery_minimumAndMaximumDischargingCurrentAtIndependent>;
  chargingAndDischargingAmount1:Converter<Type_storageBattery_chargingAndDischargingAmount1>;
  chargingAndDischargingAmount2:Converter<Type_storageBattery_chargingAndDischargingAmount2>;
  remainingCapacity1:Converter<Number>;
  remainingCapacity2:Converter<Number>;
  remainingCapacity3:Converter<Number>;
  batteryHealthState:Converter<Number>;
  batteryType:Converter<Type_storageBattery_batteryType>;
  chargingAmount1:Converter<Number>;
  dischargingAmount1:Converter<Number>;
  chargingAmount2:Converter<Number>;
  dischargingAmount2:Converter<Number>;
  chargingPower:Converter<Number>;
  dischargingPower:Converter<Number>;
  chargingCurrent:Converter<Number>;
  dischargingCurrent:Converter<Number>;
  ratedVoltageAtIndependent:Converter<Number>;
}
// 電気自動車充放電器 eoj:0x027E
export interface evChargerDischargerConverterType {
  dischargeableCapacity1:Converter<Number>;
  dischargeableCapacity2:Converter<Number>;
  remainingDischargeableCapacity1:Converter<Number>;
  remainingDischargeableCapacity2:Converter<Number>;
  remainingDischargeableCapacity3:Converter<Number>;
  ratedChargeElectricPower:Converter<Number>;
  ratedDischargeElectricPower:Converter<Number>;
  chargeDischargeStatus:Converter<Type_evChargerDischarger_chargeDischargeStatus>;
  minimumAndMaximumChargingElectricPower:Converter<Type_evChargerDischarger_minimumAndMaximumChargingElectricPower>;
  minimumAndMaximumDischargingElectricPower:Converter<Type_evChargerDischarger_minimumAndMaximumDischargingElectricPower>;
  minimumAndMaximumChargingCurrent:Converter<Type_evChargerDischarger_minimumAndMaximumChargingCurrent>;
  minimumAndMaximumDischargingCurrent:Converter<Type_evChargerDischarger_minimumAndMaximumDischargingCurrent>;
  equipmentType:Converter<Type_evChargerDischarger_equipmentType>;
  chargeableCapacity:Converter<Number>;
  remainingChargeableCapacity:Converter<Number>;
  usedCapacity1:Converter<Number>;
  usedCapacity2:Converter<Number>;
  ratedVoltage:Converter<Number>;
  instantaneousElectricPower:Converter<Number>;
  instantaneousCurrent:Converter<Number>;
  instantaneousVoltage:Converter<Number>;
  cumulativeDischargingElectricEnergy:Converter<Number>;
  cumulativeChargingElectricEnergy:Converter<Number>;
  operationMode:Converter<Type_evChargerDischarger_operationMode>;
  powerSystemInterconnectionStatus:Converter<Type_evChargerDischarger_powerSystemInterconnectionStatus>;
  remainingCapacity1:Converter<Number>;
  remainingCapacity2:Converter<Number>;
  remainingCapacity3:Converter<Number>;
  vehicleId:Converter<string>;
  targetChargingElectricEnergy1:Converter<Number>;
  targetChargingElectricEnergy2:Converter<Number>;
  targetDischargingElectricEnergy:Converter<Number>;
  chargingElectricPower:Converter<Number>;
  dischargingElectricPower:Converter<Number>;
  chargingCurrent:Converter<Number>;
  dischargingCurrent:Converter<Number>;
  ratedVoltageOfIndependentOperation:Converter<Number>;
}
// 低圧スマート電力量メータ eoj:0x0288
export interface lvSmartElectricEnergyMeterConverterType {
  normalDirectionCumulativeElectricEnergy:Converter<Type_lvSmartElectricEnergyMeter_normalDirectionCumulativeElectricEnergy>;
  normalDirectionCumulativeElectricEnergyLog1:Converter<Type_lvSmartElectricEnergyMeter_normalDirectionCumulativeElectricEnergyLog1>;
  reverseDirectionCumulativeElectricEnergy:Converter<Type_lvSmartElectricEnergyMeter_reverseDirectionCumulativeElectricEnergy>;
  reverseDirectionCumulativeElectricEnergyLog1:Converter<Type_lvSmartElectricEnergyMeter_reverseDirectionCumulativeElectricEnergyLog1>;
  instantaneousElectricPower:Converter<Type_lvSmartElectricEnergyMeter_instantaneousElectricPower>;
  instantaneousCurrent:Converter<Type_lvSmartElectricEnergyMeter_instantaneousCurrent>;
  normalDirectionCumulativeElectricEnergyAtEvery30Min:Converter<Type_lvSmartElectricEnergyMeter_normalDirectionCumulativeElectricEnergyAtEvery30Min>;
  reverseDirectionCumulativeElectricEnergyEvery30Min:Converter<Type_lvSmartElectricEnergyMeter_reverseDirectionCumulativeElectricEnergyEvery30Min>;
  cumulativeElectricEnergyLog2:Converter<Type_lvSmartElectricEnergyMeter_cumulativeElectricEnergyLog2>;
}
// 高圧スマート電力量メータ eoj:0x028A
export interface hvSmartElectricEnergyMeterConverterType {
  monthlyMaximumElectricPowerDemand:Converter<Type_hvSmartElectricEnergyMeter_monthlyMaximumElectricPowerDemand>;
  cumulativeMaximumElectricPowerDemand:Converter<Number>;
  averageElectricPowerDemand:Converter<Type_hvSmartElectricEnergyMeter_averageElectricPowerDemand>;
  electricPowerDemandLog:Converter<Type_hvSmartElectricEnergyMeter_electricPowerDemandLog>;
  cumulativeReactiveElectricEnergy:Converter<Type_hvSmartElectricEnergyMeter_cumulativeReactiveElectricEnergy>;
  cumulativeReactiveElectricEnergyAtEvery30Min:Converter<Type_hvSmartElectricEnergyMeter_cumulativeReactiveElectricEnergyAtEvery30Min>;
  cumulativeReactiveElectricEnergyLog:Converter<Type_hvSmartElectricEnergyMeter_cumulativeReactiveElectricEnergyLog>;
  fixedDate:Converter<Number>;
  cumulativeActiveElectricEnergy:Converter<Type_hvSmartElectricEnergyMeter_cumulativeActiveElectricEnergy>;
  cumulativeActiveElectricEnergyAtEvery30Min:Converter<Type_hvSmartElectricEnergyMeter_cumulativeActiveElectricEnergyAtEvery30Min>;
  cumulativeActiveElectricEnergyForPowerFactor:Converter<Type_hvSmartElectricEnergyMeter_cumulativeActiveElectricEnergyForPowerFactor>;
  activeElectricEnergyLog:Converter<Type_hvSmartElectricEnergyMeter_activeElectricEnergyLog>;
}
// 一般照明 eoj:0x0290
export interface generalLightingConverterType {
  onTimerReservation:Converter<boolean>;
  onTimerTime:Converter<string>;
  offTimerReservation:Converter<boolean>;
  offTimerTime:Converter<string>;
  brightness:Converter<Number>;
  lightColor:Converter<Type_generalLighting_lightColor>;
  brightnessLevelStep:Converter<string>;
  lightColorLevelStep:Converter<string>;
  maximumSpecifiableLevel:Converter<Type_generalLighting_maximumSpecifiableLevel>;
  maximumSettableLevelForNightLighting:Converter<Type_generalLighting_maximumSettableLevelForNightLighting>;
  operationMode:Converter<Type_generalLighting_operationMode>;
  brightnessLevelForMainLighting:Converter<Number>;
  brightnessLevelStepForMainLighting:Converter<string>;
  brightnessLevelForNightLighting:Converter<Number>;
  brightnessLevelStepForNightLighting:Converter<Type_generalLighting_brightnessLevelStepForNightLighting>;
  lightColorLevelStepForMainLighting:Converter<string>;
  lightColorLevelForNightLighting:Converter<Type_generalLighting_lightColorLevelForNightLighting>;
  lightColorLevelStepForNightLighting:Converter<string>;
  autoMode:Converter<Type_generalLighting_autoMode>;
  rgb:Converter<Type_generalLighting_rgb>;
}
// 電気自動車充電器 eoj:0x02A1
export interface evChargerConverterType {
  ratedChargeElectricPower:Converter<Number>;
  chargeStatus:Converter<Type_evCharger_chargeStatus>;
  minimumAndMaximumChargingElectricPower:Converter<Type_evCharger_minimumAndMaximumChargingElectricPower>;
  minimumAndMaximumChargingCurrent:Converter<Type_evCharger_minimumAndMaximumChargingCurrent>;
  equipmentType:Converter<Type_evCharger_equipmentType>;
  chargeableCapacity:Converter<Number>;
  remainingChargeableCapacity:Converter<Number>;
  usedCapacity1:Converter<Number>;
  ratedVoltage:Converter<Number>;
  instantaneousElectricPower:Converter<Number>;
  cumulativeChargingElectricEnergy:Converter<Number>;
  operationMode:Converter<Type_evCharger_operationMode>;
  remainingCapacity1:Converter<Number>;
  remainingCapacity3:Converter<Number>;
  vehicleId:Converter<Type_evCharger_vehicleId>;
  targetChargingElectricEnergy:Converter<Number>;
  chargingElectricPower:Converter<Number>;
  chargingCurrent:Converter<Number>;
}
// 拡張照明システム eoj:0x02A4
export interface enhancedLightingSystemConverterType {
  brightness:Converter<Number>;
  sceneId:Converter<Type_enhancedLightingSystem_sceneId>;
  maximumNumberOfSceneId:Converter<Number>;
  powerConsumptionRateList:Converter<Type_enhancedLightingSystem_powerConsumptionRateList>;
  powerConsumptionAtFullLighting:Converter<Number>;
  powerConsumptionWillBeSaved:Converter<Number>;
  powerConsumptionLimit:Converter<Type_enhancedLightingSystem_powerConsumptionLimit>;
  automaticOperationControlling:Converter<boolean>;
  fadingControlChangeTime:Converter<Number>;
}
// コントローラ eoj:0x05FF
export interface controllerConverterType {
  controllerId:Converter<string>;
  numberOfDevices:Converter<Number>;
  deviceList:Converter<Type_controller_deviceList>;
}
// 換気扇 eoj:0x0133
export interface ventilationFanConverterType {
  airFlowLevel:Converter<Type_ventilationFan_airFlowLevel>;
  automaticVentilationOperation:Converter<boolean>;
}
// 空気清浄器 eoj:0x0135
export interface airCleanerConverterType {
  airFlowLevel:Converter<Type_airCleaner_airFlowLevel>;
  airPollutionDetection:Converter<boolean>;
  smokeDetection:Converter<boolean>;
  opticalCatalystOperationStatus:Converter<boolean>;
  filterChangeNotice:Converter<boolean>;
}
// 業務用パッケージエアコン室内機 (設備用を除く) eoj:0x0156
export interface commercialAirConditionerIndoorUnitConverterType {
  thermostatState:Converter<boolean>;
  automaticOperationModeStatus:Converter<Type_commercialAirConditionerIndoorUnit_automaticOperationModeStatus>;
  operationMode:Converter<Type_commercialAirConditionerIndoorUnit_operationMode>;
  targetTemperature:Converter<Number>;
  roomTemperature:Converter<Type_commercialAirConditionerIndoorUnit_roomTemperature>;
  groupInformation:Converter<Type_commercialAirConditionerIndoorUnit_groupInformation>;
  powerConsumption:Converter<Type_commercialAirConditionerIndoorUnit_powerConsumption>;
  groupDeviceList:Converter<Type_commercialAirConditionerIndoorUnit_groupDeviceList>;
}
// 業務用パッケージエアコン室外機 (設備用を除く) eoj:0x0157
export interface commercialAirConditionerOutdoorUnitConverterType {
  specialState:Converter<boolean>;
  ratedPowerConsumption:Converter<Type_commercialAirConditionerOutdoorUnit_ratedPowerConsumption>;
  outdoorTemperature:Converter<Type_commercialAirConditionerOutdoorUnit_outdoorTemperature>;
  groupInformation:Converter<Type_commercialAirConditionerOutdoorUnit_groupInformation>;
  powerConsumption:Converter<Number>;
  powerConsumptionWillBeSaved:Converter<Number>;
  powerConsumptionLimit:Converter<Type_commercialAirConditionerOutdoorUnit_powerConsumptionLimit>;
  restrictedMinimumPowerConsumption:Converter<Number>;
  groupDeviceList:Converter<Type_commercialAirConditionerOutdoorUnit_groupDeviceList>;
}
// 電動雨戸・シャッター eoj:0x0263
export interface electricRainDoorConverterType {
  faultDescription:Converter<Type_electricRainDoor_faultDescription>;
  timerOperationMode:Converter<boolean>;
  openingSpeed:Converter<Type_electricRainDoor_openingSpeed>;
  closingSpeed:Converter<Type_electricRainDoor_closingSpeed>;
  operationTime:Converter<Number>;
  openCloseOperation:Converter<Type_electricRainDoor_openCloseOperation>;
  degreeOfOpening:Converter<Number>;
  blindAngle:Converter<Number>;
  openCloseSpeed:Converter<Type_electricRainDoor_openCloseSpeed>;
  electricLock:Converter<boolean>;
  remoteOperation:Converter<boolean>;
  selectiveDegreeOfOpening:Converter<Type_electricRainDoor_selectiveDegreeOfOpening>;
  openCloseStatus:Converter<Type_electricRainDoor_openCloseStatus>;
  slitDegreeOfOpening:Converter<Number>;
  oneTimeOpeningSpeed:Converter<Type_electricRainDoor_oneTimeOpeningSpeed>;
  oneTimeClosingSpeed:Converter<Type_electricRainDoor_oneTimeClosingSpeed>;
}
// 電気温水器 eoj:0x026B
export interface electricWaterHeaterConverterType {
  onTimerReservation:Converter<boolean>;
  onTimerTime:Converter<string>;
  automaticWaterHeating:Converter<Type_electricWaterHeater_automaticWaterHeating>;
  automaticWaterHeatingTemperatureControl:Converter<boolean>;
  waterHeatingStatus:Converter<boolean>;
  targetWaterHeatingTemperature:Converter<Type_electricWaterHeater_targetWaterHeatingTemperature>;
  heatingStopDays:Converter<Type_electricWaterHeater_heatingStopDays>;
  relativeTimeHeatingOff:Converter<string>;
  tankOperationMode:Converter<Type_electricWaterHeater_tankOperationMode>;
  daytimeReheatingPermission:Converter<boolean>;
  tankWaterTemperature:Converter<Number>;
  alarmStatus:Converter<Type_electricWaterHeater_alarmStatus>;
  hotWaterSupplyStatus:Converter<boolean>;
  relativeTimeKeepingTemperature:Converter<string>;
  energyShiftParticipation:Converter<boolean>;
  standardTimeToStartHeating:Converter<string>;
  numberOfEnergyShifts:Converter<Number>;
  waterHeatingShiftTime1:Converter<Type_electricWaterHeater_waterHeatingShiftTime1>;
  estimatedElectricEnergyAtShiftTime1:Converter<Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime1>;
  electricEnergyConsumptionRate1:Converter<Type_electricWaterHeater_electricEnergyConsumptionRate1>;
  waterHeatingShiftTime2:Converter<Type_electricWaterHeater_waterHeatingShiftTime2>;
  estimatedElectricEnergyAtShiftTime2:Converter<Type_electricWaterHeater_estimatedElectricEnergyAtShiftTime2>;
  electricEnergyConsumptionRate2:Converter<Type_electricWaterHeater_electricEnergyConsumptionRate2>;
  targetSuppliedWaterTemperature:Converter<Number>;
  targetBathWaterTemperature:Converter<Number>;
  bathWaterVolume4:Converter<Number>;
  maximumAllowableWaterVolume4:Converter<Number>;
  volume:Converter<Number>;
  mute:Converter<boolean>;
  remainingWaterVolume:Converter<Number>;
  surplusPowerPrediction:Converter<Type_electricWaterHeater_surplusPowerPrediction>;
  winterRatedPower:Converter<Number>;
  betweenSeasonRatedPower:Converter<Number>;
  summerRatedPower:Converter<Number>;
  targetWaterHeatingVolume:Converter<Number>;
  remainingWater:Converter<Number>;
  tankCapacity:Converter<Number>;
  automaticBathOperation:Converter<boolean>;
  bathReheatingOperation:Converter<boolean>;
  bathHotWaterAddition:Converter<boolean>;
  bathLukewarmWaterFunction:Converter<boolean>;
  bathWaterVolume1:Converter<Number>;
  bathWaterVolume2:Converter<Number>;
  bathroomPriority:Converter<boolean>;
  bathOperationStatusMonitor:Converter<Type_electricWaterHeater_bathOperationStatusMonitor>;
  bathWaterVolume3:Converter<Number>;
}
// 電気錠 eoj:0x026F
export interface electricLockConverterType {
  mainElectricLock:Converter<boolean>;
  subElectricLock:Converter<boolean>;
  doorGuardLocked:Converter<boolean>;
  doorOpened:Converter<boolean>;
  occupant:Converter<boolean>;
  alarmStatus:Converter<Type_electricLock_alarmStatus>;
  autoLockMode:Converter<boolean>;
  replaceBatteryLevel:Converter<boolean>;
}
// 浴室暖房乾燥機 eoj:0x0273
export interface bathroomHeaterDryerConverterType {
  onTimerReservation1:Converter<boolean>;
  onTimer:Converter<string>;
  onRelativeTimer:Converter<string>;
  offTimerReservation:Converter<boolean>;
  offTimer:Converter<string>;
  offRelativeTimer:Converter<string>;
  operationSetting:Converter<Type_bathroomHeaterDryer_operationSetting>;
  ventilationSetting:Converter<Type_bathroomHeaterDryer_ventilationSetting>;
  bathroomPrewarming:Converter<Type_bathroomHeaterDryer_bathroomPrewarming>;
  bathroomHeating:Converter<Type_bathroomHeaterDryer_bathroomHeating>;
  bathroomDrying:Converter<Type_bathroomHeaterDryer_bathroomDrying>;
  coolAirCirculation:Converter<Type_bathroomHeaterDryer_coolAirCirculation>;
  mistSauna:Converter<Type_bathroomHeaterDryer_mistSauna>;
  waterMist:Converter<Type_bathroomHeaterDryer_waterMist>;
  bathroomHumidity:Converter<Number>;
  bathroomTemperature:Converter<Number>;
  ventilationAirFlowLevel:Converter<Type_bathroomHeaterDryer_ventilationAirFlowLevel>;
  filterCleaningReminderSign:Converter<boolean>;
  humanBodyDetectionStatus:Converter<boolean>;
  onTimerReservation2:Converter<Type_bathroomHeaterDryer_onTimerReservation2>;
}
// 住宅用太陽光発電 eoj:0x0279
export interface pvPowerGenerationConverterType {
  outputPowerControl1:Converter<Number>;
  outputPowerControl2:Converter<Number>;
  surplusPurchaseControl:Converter<boolean>;
  outputPowerControlSchedule:Converter<Type_pvPowerGeneration_outputPowerControlSchedule>;
  updateScheduleDateAndTime:Converter<Type_pvPowerGeneration_updateScheduleDateAndTime>;
  surplusPurchaseControlType:Converter<boolean>;
  outputPowerChangeTime:Converter<Number>;
  upperLimitClip:Converter<Number>;
  operatingPowerFactor:Converter<Number>;
  contractType:Converter<Type_pvPowerGeneration_contractType>;
  selfConsumptionType:Converter<Type_pvPowerGeneration_selfConsumptionType>;
  approvedCapacity:Converter<Number>;
  conversionCoefficient:Converter<Number>;
  powerSystemInterconnectionStatus:Converter<Type_pvPowerGeneration_powerSystemInterconnectionStatus>;
  outputPowerRestraintStatus:Converter<Type_pvPowerGeneration_outputPowerRestraintStatus>;
  instantaneousElectricPowerGeneration:Converter<Number>;
  cumulativeElectricEnergyOfGeneration:Converter<Number>;
  cumulativeElectricEnergySold:Converter<Number>;
  powerGenerationOutputLimit1:Converter<Number>;
  powerGenerationOutputLimit2:Converter<Number>;
  limitElectricEnergySold:Converter<Number>;
  ratedElectricPowerOfgeneration:Converter<Number>;
  ratedElectricPowerOfgenerationIndependent:Converter<Number>;
}
// 床暖房 eoj:0x027B
export interface floorHeaterConverterType {
  reservationOfOnTimer:Converter<"on"|"off">;
  timeOfOnTimer:Converter<string>;
  relativeTimeOfOnTimer:Converter<string>;
  reservationOfOffTimer:Converter<"on"|"off">;
  timeOfOffTimer:Converter<string>;
  relativeTimeOfOffTimer:Converter<string>;
  maximumTargetTemperature2:Converter<Number>;
  targetTemperature1:Converter<Type_floorHeater_targetTemperature1>;
  targetTemperature2:Converter<Type_floorHeater_targetTemperature2>;
  measuredRoomTemperature:Converter<Type_floorHeater_measuredRoomTemperature>;
  measuredFloorTemperature:Converter<Type_floorHeater_measuredFloorTemperature>;
  controllableZone:Converter<Type_floorHeater_controllableZone>;
  specialOperationMode:Converter<Type_floorHeater_specialOperationMode>;
  dailyTimer:Converter<Type_floorHeater_dailyTimer>;
  workedDailyTimer1:Converter<Type_floorHeater_workedDailyTimer1>;
  workedDailyTimer2:Converter<Type_floorHeater_workedDailyTimer2>;
  ratedPowerConsumption:Converter<Number>;
  powerMeasurementMethod:Converter<Type_floorHeater_powerMeasurementMethod>;
}
// 単機能照明 eoj:0x0291
export interface monoFunctionalLightingConverterType {
  brightness:Converter<Number>;
}
// 冷凍冷蔵庫 eoj:0x03B7
export interface refrigeratorConverterType {
  quickFreeze:Converter<Type_refrigerator_quickFreeze>;
  quickRefrigeration:Converter<Type_refrigerator_quickRefrigeration>;
  icemaker:Converter<Type_refrigerator_icemaker>;
  icemakerStatus:Converter<Type_refrigerator_icemakerStatus>;
  icemakerTankStatus:Converter<Type_refrigerator_icemakerTankStatus>;
  refrigeratorHumidification:Converter<"on"|"off">;
  vegetableHumidification:Converter<"on"|"off">;
  deodorization:Converter<"on"|"off">;
  doorOpenCloseStatus:Converter<Type_refrigerator_doorOpenCloseStatus>;
  doorOpenWarning:Converter<boolean>;
  refrigeratorCompartmentDoorStatus:Converter<Type_refrigerator_refrigeratorCompartmentDoorStatus>;
  freezerCompartmentDoorStatus:Converter<Type_refrigerator_freezerCompartmentDoorStatus>;
  iceCompartmentDoorStatus:Converter<Type_refrigerator_iceCompartmentDoorStatus>;
  vegetableCompartmentDoorStatus:Converter<Type_refrigerator_vegetableCompartmentDoorStatus>;
  multiModeCompartmentDoorStatus:Converter<Type_refrigerator_multiModeCompartmentDoorStatus>;
  measuredRefrigeratorTemperature:Converter<Number>;
  measuredFreezerTemperature:Converter<Number>;
  measuredIceTemperature:Converter<Number>;
  measuredVegetableTemperature:Converter<Number>;
  measuredMultiModeTemperature:Converter<Number>;
  compressorRotationSpeed:Converter<Type_refrigerator_compressorRotationSpeed>;
  electricCurrentConsumption:Converter<Number>;
  ratedPowerConsumption:Converter<Number>;
  maximumAllowableTemperatureLevel:Converter<Type_refrigerator_maximumAllowableTemperatureLevel>;
  refrigeratorTemperature:Converter<Number>;
  freezerTemperature:Converter<Number>;
  iceTemperature:Converter<Number>;
  vegetableTemperature:Converter<Number>;
  multiModeTemperature:Converter<Number>;
  refrigeratorTemperatureLevel:Converter<Number>;
  freezerTemperatureLevel:Converter<Number>;
  iceTemperatureLevel:Converter<Number>;
  vegetableTemperatureLevel:Converter<Number>;
  multiModeTemperatureLevel:Converter<Number>;
}
// クッキングヒータ eoj:0x03B9
export interface cookingHeaterConverterType {
  relativeTimeOfOffTimers:Converter<Type_cookingHeater_relativeTimeOfOffTimers>;
  childLock:Converter<boolean>;
  radiantHeaterLock:Converter<boolean>;
  heatingStatus:Converter<Type_cookingHeater_heatingStatus>;
  heatingOperation:Converter<Type_cookingHeater_heatingOperation>;
  heatingModesOfStoves:Converter<Type_cookingHeater_heatingModesOfStoves>;
  heatingTemperature:Converter<Type_cookingHeater_heatingTemperature>;
  // heatingPower:any;  // json data error
}
// 炊飯器 eoj:0x03BB
export interface riceCookerConverterType {
  reservation:Converter<"on"|"off">;
  reservationTime:Converter<string>;
  reservationRelativeTime:Converter<string>;
  coverStatus:Converter<Type_riceCooker_coverStatus>;
  cookingStatus:Converter<Type_riceCooker_cookingStatus>;
  cookingControl:Converter<Type_riceCooker_cookingControl>;
  warmerOperation:Converter<boolean>;
  innerPotRemoved:Converter<boolean>;
  coverRemoved:Converter<boolean>;
}
// 業務用ショーケース eoj:0x03CE
export interface commercialShowcaseConverterType {
  operationMode:Converter<Type_commercialShowcase_operationMode>;
  dischargeTemperature:Converter<Number>;
  groupInformation:Converter<Type_commercialShowcase_groupInformation>;
  showcaseType:Converter<Type_commercialShowcase_showcaseType>;
  doorType:Converter<Type_commercialShowcase_doorType>;
  refrigeratorType:Converter<Type_commercialShowcase_refrigeratorType>;
  shapeType:Converter<Type_commercialShowcase_shapeType>;
  purposeType:Converter<Type_commercialShowcase_purposeType>;
  internalLightingOperationStatus:Converter<boolean>;
  externalLightingOperationStatus:Converter<boolean>;
  compressorOperationStatus:Converter<boolean>;
  internalTemperature:Converter<Number>;
  ratedElectricPowerForFreezing:Converter<Number>;
  ratedElectricPowerForDefrostingHeater:Converter<Number>;
  ratedElectricPowerForFanMotor:Converter<Number>;
  heaterOperationStatus:Converter<boolean>;
  insideLightingType:Converter<Type_commercialShowcase_insideLightingType>;
  outsideLightingType:Converter<Type_commercialShowcase_outsideLightingType>;
  targetInsideBrightness:Converter<Number>;
  targetOutsideBrightness:Converter<Number>;
  targetInsideTemperature:Converter<Number>;
  groupDeviceList:Converter<Type_commercialShowcase_groupDeviceList>;
}
// 業務用ショーケース向け室外機 eoj:0x03D4
export interface commercialShowcaseOutdoorUnitConverterType {
  exceptionalStatus:Converter<boolean>;
  operationMode:Converter<Type_commercialShowcaseOutdoorUnit_operationMode>;
  outdoorAirTemperature:Converter<Number>;
  groupInformation:Converter<Type_commercialShowcaseOutdoorUnit_groupInformation>;
  compressorOperationStatus:Converter<boolean>;
  groupDeviceList:Converter<Type_commercialShowcaseOutdoorUnit_groupDeviceList>;
}
// スイッチ (JEMA/HA端子対応) eoj:0x05FD
export interface switchConverterType {
  connectedDevice:Converter<string>;
}
// ハイブリッド給湯機 eoj:0x02A6
export interface hybridWaterHeaterConverterType {
  automaticWaterHeating:Converter<Type_hybridWaterHeater_automaticWaterHeating>;
  waterHeatingStatus:Converter<boolean>;
  heaterStatus:Converter<boolean>;
  hotWaterSupplyModeForAuxiliaryHeatSourceMachine:Converter<boolean>;
  heaterModeForAuxiliaryHeatSourceMachine:Converter<boolean>;
  linkageModeForSolarPowerGeneration:Converter<Type_hybridWaterHeater_linkageModeForSolarPowerGeneration>;
  solarPowerGenerationsUtilizationTime:Converter<Type_hybridWaterHeater_solarPowerGenerationsUtilizationTime>;
  hotWaterSupplyStatus:Converter<boolean>;
  remainingWater:Converter<Number>;
  tankCapacity:Converter<Number>;
}
// 洗濯乾燥機 eoj:0x03D3
export interface washerDryerConverterType {
  onTimerReservationStatus:Converter<Type_washerDryer_onTimerReservationStatus>;
  onTimerAbsolute:Converter<string>;
  onTimerRelative:Converter<Number>;
  doorOpenStatus:Converter<Type_washerDryer_doorOpenStatus>;
  runningStatus:Converter<Type_washerDryer_runningStatus>;
  washerDryerCycle1:Converter<Type_washerDryer_washerDryerCycle1>;
  washerDryerCycle2:Converter<Type_washerDryer_washerDryerCycle2>;
  dryerCycle:Converter<Type_washerDryer_dryerCycle>;
  washerDryerCycleOptions1:Converter<Type_washerDryer_washerDryerCycleOptions1>;
  washerDryerCycleOptions2:Converter<Type_washerDryer_washerDryerCycleOptions2>;
  washerDryerCycleOptions3:Converter<Type_washerDryer_washerDryerCycleOptions3>;
  waterFlowRate:Converter<Type_washerDryer_waterFlowRate>;
  spinDryingRotationSpeed:Converter<Type_washerDryer_spinDryingRotationSpeed>;
  dryingDegree:Converter<Type_washerDryer_dryingDegree>;
  washingTimeRemaining:Converter<Type_washerDryer_washingTimeRemaining>;
  dryingTimeRemaining:Converter<Type_washerDryer_dryingTimeRemaining>;
  onTimerElapsed:Converter<Number>;
  presoakingTime:Converter<Type_washerDryer_presoakingTime>;
  currentStage:Converter<Type_washerDryer_currentStage>;
  waterVolumeByLiter:Converter<Type_washerDryer_waterVolumeByLiter>;
  waterVolumeByStep:Converter<Type_washerDryer_waterVolumeByStep>;
  washingTime:Converter<Type_washerDryer_washingTime>;
  rinsingCount:Converter<Type_washerDryer_rinsingCount>;
  rinsingProcess:Converter<Type_washerDryer_rinsingProcess>;
  spinDryingTime:Converter<Type_washerDryer_spinDryingTime>;
  dryingTime:Converter<Type_washerDryer_dryingTime>;
  waterTemperature:Converter<Type_washerDryer_waterTemperature>;
  bathtubWaterRecycle:Converter<Type_washerDryer_bathtubWaterRecycle>;
  wrinklingMinimization:Converter<Type_washerDryer_wrinklingMinimization>;
  washingDryingTimeRemaining:Converter<Type_washerDryer_washingDryingTimeRemaining>;
  doorLockStatus:Converter<boolean>;
}
// 温度センサ eoj:0x0011
export interface temperatureSensorConverterType {
  value:Converter<Number>;
}
// 電力量センサ eoj:0x0022
export interface electricEnergySensorConverterType {
  cumulativeElectricEnergy:Converter<Number>;
  mediumCapacitySensorValue:Converter<Number>;
  smallCapacitySensorValue:Converter<Number>;
  largeCapacitySensorValue:Converter<Number>;
  log:Converter<Type_electricEnergySensor_log>;
  effectiveVoltageValue:Converter<Number>;
}
// 電流値センサ eoj:0x0023
export interface currentSensorConverterType {
  unsignedValue:Converter<Number>;
  ratedVoltage:Converter<Number>;
  signedValue:Converter<Number>;
}
// 空調換気扇 eoj:0x0134
export interface airConditionerVentilationFanConverterType {
  airFlowLevel:Converter<Type_airConditionerVentilationFan_airFlowLevel>;
  ventilationMethod:Converter<Type_airConditionerVentilationFan_ventilationMethod>;
  ventilationMode:Converter<Type_airConditionerVentilationFan_ventilationMode>;
  highlowLevel:Converter<Number>;
  targetHumidity:Converter<Number>;
  currentConsumption:Converter<Number>;
  humidity:Converter<Number>;
  outdoorTemperature:Converter<Number>;
  ventilationAuto:Converter<boolean>;
  co2Concentration:Converter<Number>;
  smokeDetection:Converter<boolean>;
  pollutionDetection:Converter<boolean>;
  outdoorHumidity:Converter<Number>;
  returnAirTemperature:Converter<Type_airConditionerVentilationFan_returnAirTemperature>;
  returnAirHumidity:Converter<Type_airConditionerVentilationFan_returnAirHumidity>;
  chargingAirTemperature:Converter<Number>;
  chargingAirHumidity:Converter<Number>;
  dischargingAirTemperature:Converter<Number>;
  dischargingAirHumidity:Converter<Number>;
  heatExchangerOperationStatus:Converter<boolean>;
}
// 冷温水熱源機 eoj:0x027A
export interface coldOrHotWaterHeatSourceEquipmentConverterType {
  onTimerReservation:Converter<boolean>;
  onTimerTime:Converter<string>;
  onTimerRelativeTime:Converter<string>;
  offTimerReservation:Converter<boolean>;
  offTimerTime:Converter<string>;
  offTimerRelativeTime:Converter<string>;
  coldWaterTemperatue2MaximumLevel:Converter<Number>;
  wormWaterTemperatue2MaximumLevel:Converter<Number>;
  operationMode:Converter<Type_coldOrHotWaterHeatSourceEquipment_operationMode>;
  waterTemperature1:Converter<Type_coldOrHotWaterHeatSourceEquipment_waterTemperature1>;
  waterTemperature2:Converter<Type_coldOrHotWaterHeatSourceEquipment_waterTemperature2>;
  outwardWaterTemperatureExit:Converter<Type_coldOrHotWaterHeatSourceEquipment_outwardWaterTemperatureExit>;
  inwardWaterTemperatureEntrance:Converter<Type_coldOrHotWaterHeatSourceEquipment_inwardWaterTemperatureEntrance>;
  specialOperation:Converter<Type_coldOrHotWaterHeatSourceEquipment_specialOperation>;
  dailyTimer:Converter<Type_coldOrHotWaterHeatSourceEquipment_dailyTimer>;
  dailyTimer1:Converter<string>;
  dailyTimer2:Converter<string>;
  ratedPowerconsumption:Converter<Type_coldOrHotWaterHeatSourceEquipment_ratedPowerconsumption>;
  powerConsumptionMeasurementMethod:Converter<Type_coldOrHotWaterHeatSourceEquipment_powerConsumptionMeasurementMethod>;
}
// 電力量メータ eoj:0x0280
export interface wattHourMeterConverterType {
  cumulativeElectricEnergy:Converter<Number>;
  cumulativeElectricEnergyLog1:Converter<Type_wattHourMeter_cumulativeElectricEnergyLog1>;
}
// 分電盤メータリング eoj:0x0287
export interface powerDistributionBoardMeteringConverterType {
  masterRatedCapacity:Converter<Number>;
  numberOfMeasurementChannelsSimplex:Converter<Type_powerDistributionBoardMetering_numberOfMeasurementChannelsSimplex>;
  cumulativeElectricEnergyListSimplex:Converter<Type_powerDistributionBoardMetering_cumulativeElectricEnergyListSimplex>;
  instantaneousCurrentListSimplex:Converter<Type_powerDistributionBoardMetering_instantaneousCurrentListSimplex>;
  instantaneousElectricPowerListSimplex:Converter<Type_powerDistributionBoardMetering_instantaneousElectricPowerListSimplex>;
  numberOfMeasurementChannelsDuplex:Converter<Type_powerDistributionBoardMetering_numberOfMeasurementChannelsDuplex>;
  cumulativeElectricEnergyListDuplex:Converter<Type_powerDistributionBoardMetering_cumulativeElectricEnergyListDuplex>;
  instantaneousCurrentListDuplex:Converter<Type_powerDistributionBoardMetering_instantaneousCurrentListDuplex>;
  instantaneousElectricPowerListDuplex:Converter<Type_powerDistributionBoardMetering_instantaneousElectricPowerListDuplex>;
  normalDirectionCumulativeElectricEnergy:Converter<Type_powerDistributionBoardMetering_normalDirectionCumulativeElectricEnergy>;
  reverseDirectionCumulativeElectricEnergy:Converter<Type_powerDistributionBoardMetering_reverseDirectionCumulativeElectricEnergy>;
  normalDirectionCumulativeElectricEnergyLog:Converter<Type_powerDistributionBoardMetering_normalDirectionCumulativeElectricEnergyLog>;
  reverseDirectionCumulativeElectricEnergyLog:Converter<Type_powerDistributionBoardMetering_reverseDirectionCumulativeElectricEnergyLog>;
  instantaneousElectricPower:Converter<Type_powerDistributionBoardMetering_instantaneousElectricPower>;
  instantaneousCurrent:Converter<Type_powerDistributionBoardMetering_instantaneousCurrent>;
  instantaneousVoltage:Converter<Type_powerDistributionBoardMetering_instantaneousVoltage>;
  measurementChannel1:Converter<Type_powerDistributionBoardMetering_measurementChannel1>;
  measurementChannel2:Converter<Type_powerDistributionBoardMetering_measurementChannel2>;
  measurementChannel3:Converter<Type_powerDistributionBoardMetering_measurementChannel3>;
  measurementChannel4:Converter<Type_powerDistributionBoardMetering_measurementChannel4>;
  measurementChannel5:Converter<Type_powerDistributionBoardMetering_measurementChannel5>;
  measurementChannel6:Converter<Type_powerDistributionBoardMetering_measurementChannel6>;
  measurementChannel7:Converter<Type_powerDistributionBoardMetering_measurementChannel7>;
  measurementChannel8:Converter<Type_powerDistributionBoardMetering_measurementChannel8>;
  measurementChannel9:Converter<Type_powerDistributionBoardMetering_measurementChannel9>;
  measurementChannel10:Converter<Type_powerDistributionBoardMetering_measurementChannel10>;
  measurementChannel11:Converter<Type_powerDistributionBoardMetering_measurementChannel11>;
  measurementChannel12:Converter<Type_powerDistributionBoardMetering_measurementChannel12>;
  measurementChannel13:Converter<Type_powerDistributionBoardMetering_measurementChannel13>;
  measurementChannel14:Converter<Type_powerDistributionBoardMetering_measurementChannel14>;
  measurementChannel15:Converter<Type_powerDistributionBoardMetering_measurementChannel15>;
  measurementChannel16:Converter<Type_powerDistributionBoardMetering_measurementChannel16>;
  measurementChannel17:Converter<Type_powerDistributionBoardMetering_measurementChannel17>;
  measurementChannel18:Converter<Type_powerDistributionBoardMetering_measurementChannel18>;
  measurementChannel19:Converter<Type_powerDistributionBoardMetering_measurementChannel19>;
  measurementChannel20:Converter<Type_powerDistributionBoardMetering_measurementChannel20>;
  measurementChannel21:Converter<Type_powerDistributionBoardMetering_measurementChannel21>;
  measurementChannel22:Converter<Type_powerDistributionBoardMetering_measurementChannel22>;
  measurementChannel23:Converter<Type_powerDistributionBoardMetering_measurementChannel23>;
  measurementChannel24:Converter<Type_powerDistributionBoardMetering_measurementChannel24>;
  measurementChannel25:Converter<Type_powerDistributionBoardMetering_measurementChannel25>;
  measurementChannel26:Converter<Type_powerDistributionBoardMetering_measurementChannel26>;
  measurementChannel27:Converter<Type_powerDistributionBoardMetering_measurementChannel27>;
  measurementChannel28:Converter<Type_powerDistributionBoardMetering_measurementChannel28>;
  measurementChannel29:Converter<Type_powerDistributionBoardMetering_measurementChannel29>;
  measurementChannel30:Converter<Type_powerDistributionBoardMetering_measurementChannel30>;
  measurementChannel31:Converter<Type_powerDistributionBoardMetering_measurementChannel31>;
  measurementChannel32:Converter<Type_powerDistributionBoardMetering_measurementChannel32>;
}
// テレビ eoj:0x0602
export interface tvConverterType {
  displayControlStatus:Converter<Type_tv_displayControlStatus>;
  stringSettingAcceptanceStatus:Converter<Type_tv_stringSettingAcceptanceStatus>;
  supportedCharacterCode:Converter<Type_tv_supportedCharacterCode>;
  characterStringPresented:Converter<Type_tv_characterStringPresented>;
  lengthOfStringAccepted:Converter<Type_tv_lengthOfStringAccepted>;
}
// 共通項目
const Defaultcommon:commonConverterType = {
  operationStatus:new DefaultConverter<boolean>(),
  installationLocation:new UnknownConverter<string>(),
  protocol:new UnknownConverter<{type:string,version:string}>(),
  id:new UnknownConverter<string>(),
  instantaneousElectricPowerConsumption:new DefaultConverter<number>(),
  cumulativeElectricEnergy:new DefaultConverter<number>(),
  manufacturerFaultCode:new UnknownConverter<string>(),
  currentLimit:new DefaultConverter<number>(),
  faultStatus:new DefaultConverter<boolean>(),
  faultDescription:new UnknownConverter<string>(),
  manufacturer:new UnknownConverter<{code:string,descriptions:{ja:string,en:string}}>(),
  businessFacilityCode:new UnknownConverter<string>(),
  productCode:new UnknownConverter<string>(),
  serialNumber:new UnknownConverter<string>(),
  productionDate:new DefaultConverter<string>(),
  powerSaving:new DefaultConverter<boolean>(),
  currentDateAndTime:new DefaultConverter<string>(),
  powerLimit:new DefaultConverter<number>(),
  hourMeter:new DefaultConverter<number>(),
};
// 家庭用エアコン eoj:0x0130
const DefaulthomeAirConditioner:homeAirConditionerConverterType = {
  onTimerReservation:new DefaultConverter<"timeOnRelativeTimeOn"|"timeOffRelativeTimeOff"|"timeOnRelativeTimeOff"|"timeOffRelativeTimeOn">(),
  onTime:new DefaultConverter<string>(),
  relativeOnTime:new DefaultConverter<string>(),
  offTimerReservation:new DefaultConverter<"timeBasedAndRelativeTimeBasedOn"|"bothOff"|"timeBasedOn"|"relativeTimeBasedOn">(),
  offTime:new DefaultConverter<string>(),
  relativeOffTime:new DefaultConverter<string>(),
  airFlowLevel:new DefaultConverter<Number|"auto">(),
  automaticControlAirFlowDirection:new DefaultConverter<"auto"|"nonAuto"|"autoVertical"|"autoHorizontal">(),
  automaticSwingAirFlow:new DefaultConverter<"off"|"vertical"|"holizontal"|"verticalAndHolizontal">(),
  airFlowDirectionVertical:new DefaultConverter<"uppermost"|"lowermost"|"central"|"upperCenter"|"lowerCenter">(),
  airFlowDirectionHorizontal:new DefaultConverter<"rc_r"|"l_lc"|"lc_c_rc"|"l_lc_rc_r"|"r"|"rc"|"c"|"c_r"|"c_rc"|"c_rc_r"|"lc"|"lc_r"|"lc_rc"|"lc_rc_r"|"lc_c"|"lc_c_r"|"lc_c_rc_r"|"l"|"l_r"|"l_rc"|"l_rc_r"|"l_c"|"l_c_r"|"l_c_rc"|"l_c_rc_r"|"l_lc_r"|"l_lc_rc"|"l_lc_c"|"l_lc_c_r"|"l_lc_c_rc"|"l_lc_c_rc_r">(),
  specialState:new DefaultConverter<"normal"|"defrosting"|"preheating"|"heatRemoval">(),
  nonPriorityState:new DefaultConverter<boolean>(),
  operationMode:new DefaultConverter<"auto"|"cooling"|"heating"|"dehumidification"|"circulation"|"other">(),
  automaticTemperatureControl:new DefaultConverter<"auto"|"nonAuto">(),
  highspeedOperation:new DefaultConverter<"normal"|"highspeed"|"silent">(),
  targetTemperature:new DefaultConverter<Number|"undefined">(),
  relativeHumidityDehumidifying:new DefaultConverter<number>(),
  targetTemperatureCooling:new DefaultConverter<Number|"undefined">(),
  targetTemperatureHeating:new DefaultConverter<Number|"undefined">(),
  targetTemperatureDehumidifying:new DefaultConverter<Number|"undefined">(),
  ratedPowerConsumption:new UnknownConverter<{cooling:Number|"unsupported",heating:Number|"unsupported",dehumidifying:Number|"unsupported",circulation:Number|"unsupported"}>(),
  currentConsumption:new DefaultConverter<number>(),
  humidity:new DefaultConverter<Number|"unmeasurable">(),
  roomTemperature:new DefaultConverter<Number|"unmeasurable">(),
  temperatureUserRemoteControl:new DefaultConverter<number>(),
  airFlowTemperature:new DefaultConverter<Number|"unmeasurable">(),
  outdoorTemperature:new DefaultConverter<Number|"unmeasurable">(),
  relativeTemperature:new DefaultConverter<Number|"unmeasurable">(),
  ventilationFunction:new DefaultConverter<"onOutlet"|"off"|"onIntake"|"onOutletAndIntake">(),
  humidifierFunction:new DefaultConverter<"on"|"off">(),
  ventilationAirFlowLevel:new DefaultConverter<Number|"auto">(),
  humidificationLevel:new DefaultConverter<Number|"auto">(),
  airCleaningMethod:new UnknownConverter<{electronic:"no"|"yes",clusterIon:"no"|"yes"}>(),
  airPurifierFunction:new UnknownConverter<{electronicLevel:Number,electronicMode:"off"|"on",electronicAuto:"nonAuto"|"auto",clusterIonLevel:Number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"}>(),
  airRefreshMethod:new UnknownConverter<{minusIon:"no"|"yes",clusterIon:"no"|"yes"}>(),
  airRefresherFunction:new UnknownConverter<{minusIonLevel:Number,minusIonMode:"off"|"on",minusIonAuto:"nonAuto"|"auto",clusterIonLevel:Number,clusterIonMode:"off"|"on",clusterIonAuto:"nonAuto"|"auto"}>(),
  selfCleaningMethod:new UnknownConverter<{ozone:"no"|"yes",drying:"no"|"yes"}>(),
  selfCleaningFunction:new UnknownConverter<{ozoneLevel:Number,ozoneMode:"off"|"on",ozoneAuto:"nonAuto"|"auto",dryingLevel:Number,dryingMode:"off"|"on",dryingAuto:"nonAuto"|"auto"}>(),
  specialFunction:new DefaultConverter<"noSetting"|"clothesDryer"|"condensationSuppressor"|"miteAndMoldControl"|"activeDefrosting">(),
  componentsOperationStatus:new UnknownConverter<{compressor:"off"|"on",thermostat:"off"|"on"}>(),
  thermostatOverride:new DefaultConverter<"normal"|"on"|"off">(),
  airPurification:new DefaultConverter<"on"|"off">(),
};
// 瞬間式給湯器 eoj:0x0272
const DefaultinstantaneousWaterHeater:instantaneousWaterHeaterConverterType = {
  onTimerReservation:new DefaultConverter<boolean>(),
  onTimerTime:new DefaultConverter<string>(),
  onTimerRelativeTimeSettingValue:new DefaultConverter<string>(),
  hotWaterHeatingStatus:new DefaultConverter<boolean>(),
  targetSuppliedWaterTemperature:new DefaultConverter<number>(),
  hotWaterWarmerSetting:new DefaultConverter<boolean>(),
  bathWaterVolume4:new DefaultConverter<number>(),
  maximumAllowableWaterVolume4:new DefaultConverter<number>(),
  volume:new DefaultConverter<number>(),
  mute:new DefaultConverter<boolean>(),
  tergetAutomaticOprationTime:new DefaultConverter<string|"limitless">(),
  remainingAutomaticOperationTime:new DefaultConverter<string|"limitless">(),
  targetBathWaterTemperature:new DefaultConverter<number>(),
  bathWaterHeatingStatus:new DefaultConverter<boolean>(),
  automaticBathOperation:new DefaultConverter<boolean>(),
  tergetBathAdditionalBoilupOperation:new DefaultConverter<boolean>(),
  bathHotWaterAddition:new DefaultConverter<boolean>(),
  bathLukewarmWaterFunction:new DefaultConverter<boolean>(),
  bathWaterVolume1:new DefaultConverter<number>(),
  bathWaterVolume2:new DefaultConverter<number>(),
  bathroomPriority:new DefaultConverter<boolean>(),
  showerHotWaterSupplyStatus:new DefaultConverter<boolean>(),
  kitchenHotWaterSupplyStatus:new DefaultConverter<boolean>(),
  hotWaterWarmerONTimerReservationSetting:new DefaultConverter<boolean>(),
  tergetHotWaterWarmerONTimerTime:new DefaultConverter<string>(),
  bathWaterVolume3:new DefaultConverter<number>(),
  bathOperationStatus:new DefaultConverter<"runningHotWater"|"noOperation"|"keepingTemperature">(),
};
// 燃料電池 eoj:0x027C
const DefaultfuelCell:fuelCellConverterType = {
  waterTemperatureInWaterHeater:new DefaultConverter<number>(),
  ratedElectricPowerOfGeneration:new DefaultConverter<number>(),
  heatCapacityOfStorageTank:new DefaultConverter<number>(),
  instantaneousElectricPowerOfGeneration:new DefaultConverter<number>(),
  cumulativeElectricEnergyOfGeneration:new DefaultConverter<number>(),
  instantaneousGasConsumption:new DefaultConverter<number>(),
  cumulativeGasConsumption:new DefaultConverter<number>(),
  powerGenerationSetting:new DefaultConverter<"generationOn"|"generationOff">(),
  powerGenerationStatus:new DefaultConverter<"generating"|"stopped"|"starting"|"stopping"|"idling">(),
  inHouseInstantaneousPowerConsumption:new DefaultConverter<number>(),
  inHouseCumulativePowerConsumption:new DefaultConverter<number>(),
  powerSystemInterconnectionStatus:new DefaultConverter<"reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable">(),
  requestedTimeOfGeneration:new UnknownConverter<{startTime:string,endTime:string}|"undefined">(),
  powerGenerationMode:new DefaultConverter<"maximumRating"|"loadFollowing">(),
  remainingHotWaterAmount:new DefaultConverter<number>(),
  tankCapacity:new DefaultConverter<number>(),
};
// 蓄電池 eoj:0x027D
const DefaultstorageBattery:storageBatteryConverterType = {
  acEffectiveChargingCapacity:new DefaultConverter<number>(),
  acEffectiveDischargingCapacity:new DefaultConverter<number>(),
  acChargeableCapacity:new DefaultConverter<number>(),
  acDischargeableCapacity:new DefaultConverter<number>(),
  acChargeableElectricEnergy:new DefaultConverter<number>(),
  acDischargeableElectricEnergy:new DefaultConverter<number>(),
  acChargeUpperLimit:new DefaultConverter<number>(),
  acDischargeLowerLimit:new DefaultConverter<number>(),
  acCumulativeChargingElectricEnergy:new DefaultConverter<number>(),
  acCumulativeDischargingElectricEnergy:new DefaultConverter<number>(),
  acTargetChargingElectricEnergy:new DefaultConverter<Number|"notSet">(),
  acTargetDischargingElectricEnergy:new DefaultConverter<Number|"notSet">(),
  chargingMethod:new DefaultConverter<"maximum"|"surplus"|"designatedPower"|"designatedCurrent"|"other">(),
  dischargingMethod:new DefaultConverter<"maximum"|"loadFollowing"|"designatedPower"|"designatedCurrent"|"other">(),
  acRatedElectricEnergy:new DefaultConverter<number>(),
  minimumAndMaximumChargingElectricPower:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  minimumAndMaximumDischargingElectricPower:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  minimumAndMaximumChargingCurrent:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  minimumAndMaximumDischargingCurrent:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  reInterconnectionPermission:new DefaultConverter<"permitted"|"prohibited">(),
  operationPermission:new DefaultConverter<"permitted"|"prohibited">(),
  independentOperationPermission:new DefaultConverter<"permitted"|"prohibited">(),
  actualOperationMode:new DefaultConverter<"rapidCharging"|"charging"|"discharging"|"standby"|"test"|"auto"|"restart"|"capacityRecalculation"|"other">(),
  ratedElectricEnergy:new DefaultConverter<number>(),
  ratedCapacity:new DefaultConverter<number>(),
  ratedVoltage:new DefaultConverter<number>(),
  instantaneousChargingAndDischargingElectricPower:new DefaultConverter<number>(),
  instantaneousChargingAndDischargingCurrent:new DefaultConverter<number>(),
  instantaneousChargingAndDischargingVoltage:new DefaultConverter<number>(),
  cumulativeDischargingElectricEnergy:new DefaultConverter<number>(),
  cumulativeChargingElectricEnergy:new DefaultConverter<number>(),
  operationMode:new DefaultConverter<"rapidCharging"|"charging"|"discharging"|"standby"|"test"|"auto"|"restart"|"capacityRecalculation"|"other">(),
  powerSystemInterconnectionStatus:new DefaultConverter<"reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable">(),
  minimumAndMaximumChargingPowerAtIndependent:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  minimumAndMaximumDischargingPowerAtIndependent:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  minimumAndMaximumChargingCurrentAtIndependent:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  minimumAndMaximumDischargingCurrentAtIndependent:new UnknownConverter<{minValue:Number,maxValue:Number}>(),
  chargingAndDischargingAmount1:new DefaultConverter<Number|Number>(),
  chargingAndDischargingAmount2:new DefaultConverter<Number|Number>(),
  remainingCapacity1:new DefaultConverter<number>(),
  remainingCapacity2:new DefaultConverter<number>(),
  remainingCapacity3:new DefaultConverter<number>(),
  batteryHealthState:new DefaultConverter<number>(),
  batteryType:new DefaultConverter<"unknown"|"lead"|"ni_mh"|"ni_cd"|"lib"|"zinc"|"alkaline">(),
  chargingAmount1:new DefaultConverter<number>(),
  dischargingAmount1:new DefaultConverter<number>(),
  chargingAmount2:new DefaultConverter<number>(),
  dischargingAmount2:new DefaultConverter<number>(),
  chargingPower:new DefaultConverter<number>(),
  dischargingPower:new DefaultConverter<number>(),
  chargingCurrent:new DefaultConverter<number>(),
  dischargingCurrent:new DefaultConverter<number>(),
  ratedVoltageAtIndependent:new DefaultConverter<number>(),
};
// 電気自動車充放電器 eoj:0x027E
const DefaultevChargerDischarger:evChargerDischargerConverterType = {
  dischargeableCapacity1:new DefaultConverter<number>(),
  dischargeableCapacity2:new DefaultConverter<number>(),
  remainingDischargeableCapacity1:new DefaultConverter<number>(),
  remainingDischargeableCapacity2:new DefaultConverter<number>(),
  remainingDischargeableCapacity3:new DefaultConverter<number>(),
  ratedChargeElectricPower:new DefaultConverter<number>(),
  ratedDischargeElectricPower:new DefaultConverter<number>(),
  chargeDischargeStatus:new DefaultConverter<"undefined"|"notConnected"|"connected"|"chargeable"|"dischargeable"|"chargeableDischargeable"|"unknown">(),
  minimumAndMaximumChargingElectricPower:new UnknownConverter<{minimumElectricPower:Number,maximumElectricPower:Number}>(),
  minimumAndMaximumDischargingElectricPower:new UnknownConverter<{minimumElectricPower:Number,maximumElectricPower:Number}>(),
  minimumAndMaximumChargingCurrent:new UnknownConverter<{minimumCurrent:Number,maximumCurrent:Number}>(),
  minimumAndMaximumDischargingCurrent:new UnknownConverter<{minimumCurrent:Number,maximumCurrent:Number}>(),
  equipmentType:new DefaultConverter<"ac_cplt"|"ac_hlc_charge"|"ac_hlc_chargedischarge"|"dc_aa_charge"|"dc_aa_chargedischarge"|"dc_aa_discharge"|"dc_bb_charge"|"dc_bb_chargedischarge"|"dc_bb_discharge"|"dc_ee_charge"|"dc_ee_chargedischarge"|"dc_ee_discharge"|"dc_ff_charge"|"dc_ff_chargedDischarge"|"dc_ff_discharge">(),
  chargeableCapacity:new DefaultConverter<number>(),
  remainingChargeableCapacity:new DefaultConverter<number>(),
  usedCapacity1:new DefaultConverter<number>(),
  usedCapacity2:new DefaultConverter<number>(),
  ratedVoltage:new DefaultConverter<number>(),
  instantaneousElectricPower:new DefaultConverter<number>(),
  instantaneousCurrent:new DefaultConverter<number>(),
  instantaneousVoltage:new DefaultConverter<number>(),
  cumulativeDischargingElectricEnergy:new DefaultConverter<number>(),
  cumulativeChargingElectricEnergy:new DefaultConverter<number>(),
  operationMode:new DefaultConverter<"charge"|"discharge"|"standby"|"idle"|"other">(),
  powerSystemInterconnectionStatus:new DefaultConverter<"reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable">(),
  remainingCapacity1:new DefaultConverter<number>(),
  remainingCapacity2:new DefaultConverter<number>(),
  remainingCapacity3:new DefaultConverter<number>(),
  vehicleId:new UnknownConverter<string>(),
  targetChargingElectricEnergy1:new DefaultConverter<number>(),
  targetChargingElectricEnergy2:new DefaultConverter<number>(),
  targetDischargingElectricEnergy:new DefaultConverter<number>(),
  chargingElectricPower:new DefaultConverter<number>(),
  dischargingElectricPower:new DefaultConverter<number>(),
  chargingCurrent:new DefaultConverter<number>(),
  dischargingCurrent:new DefaultConverter<number>(),
  ratedVoltageOfIndependentOperation:new DefaultConverter<number>(),
};
// 低圧スマート電力量メータ eoj:0x0288
const DefaultlvSmartElectricEnergyMeter:lvSmartElectricEnergyMeterConverterType = {
  normalDirectionCumulativeElectricEnergy:new DefaultConverter<Number|"noData">(),
  normalDirectionCumulativeElectricEnergyLog1:new UnknownConverter<{day:Number|"defaultValue",electricEnergy:(Number|"noData")[]}>(),
  reverseDirectionCumulativeElectricEnergy:new DefaultConverter<Number|"noData">(),
  reverseDirectionCumulativeElectricEnergyLog1:new UnknownConverter<{day:Number|"defaultValue",electricEnergy:(Number|"noData")[]}>(),
  instantaneousElectricPower:new DefaultConverter<Number|"noData">(),
  instantaneousCurrent:new UnknownConverter<{rPhase:Number|"noData",tPhase:Number|"noData"}>(),
  normalDirectionCumulativeElectricEnergyAtEvery30Min:new UnknownConverter<{dateAndTime:string,electricEnergy:Number|"noData"}>(),
  reverseDirectionCumulativeElectricEnergyEvery30Min:new UnknownConverter<{dateAndTime:string,electricEnergy:Number|"noData"}>(),
  cumulativeElectricEnergyLog2:new UnknownConverter<{dateAndTime:string,numberOfCollectionSegments:Number,electricEnergy:({normalDirectionElectricEnergy:Number|"noData",reverseDirectionElectricEnergy:Number|"noData"})[]}>(),
};
// 高圧スマート電力量メータ eoj:0x028A
const DefaulthvSmartElectricEnergyMeter:hvSmartElectricEnergyMeterConverterType = {
  monthlyMaximumElectricPowerDemand:new DefaultConverter<Number|"noData">(),
  cumulativeMaximumElectricPowerDemand:new DefaultConverter<number>(),
  averageElectricPowerDemand:new UnknownConverter<{dateAndTime:string,electricPower:Number|"noData"}>(),
  electricPowerDemandLog:new UnknownConverter<{day:Number|"defaultValue",electricPower:(Number|"noData")[]}>(),
  cumulativeReactiveElectricEnergy:new UnknownConverter<{dateAndTime:string,reactiveElectricEnergy:Number|"noData"}>(),
  cumulativeReactiveElectricEnergyAtEvery30Min:new UnknownConverter<{dateAndTime:string,reactiveElectricEnergy:Number|"noData"}>(),
  cumulativeReactiveElectricEnergyLog:new UnknownConverter<{day:Number|"defaultValue",reactiveElectricEnergy:(Number|"noData")[]}>(),
  fixedDate:new DefaultConverter<number>(),
  cumulativeActiveElectricEnergy:new UnknownConverter<{dateAndTime:string,activeElectricEnergy:Number|"noData"}>(),
  cumulativeActiveElectricEnergyAtEvery30Min:new UnknownConverter<{dateAndTime:string,activeElectricEnergy:Number|"noData"}>(),
  cumulativeActiveElectricEnergyForPowerFactor:new UnknownConverter<{dateAndTime:string,electricEnergy:Number|"noData"}>(),
  activeElectricEnergyLog:new UnknownConverter<{day:Number|"defaultValue",activeElectricEnergy:(Number|"noData")[]}>(),
};
// 一般照明 eoj:0x0290
const DefaultgeneralLighting:generalLightingConverterType = {
  onTimerReservation:new DefaultConverter<boolean>(),
  onTimerTime:new DefaultConverter<string>(),
  offTimerReservation:new DefaultConverter<boolean>(),
  offTimerTime:new DefaultConverter<string>(),
  brightness:new DefaultConverter<number>(),
  lightColor:new DefaultConverter<"incandescent"|"white"|"daylightWhite"|"daylightColor"|"other">(),
  brightnessLevelStep:new UnknownConverter<string>(),
  lightColorLevelStep:new UnknownConverter<string>(),
  maximumSpecifiableLevel:new UnknownConverter<{brightness:Number|"notBrightness",color:Number|"notColor"}>(),
  maximumSettableLevelForNightLighting:new UnknownConverter<{brightness:Number|"notBrightness",color:Number|"notColor"}>(),
  operationMode:new DefaultConverter<"auto"|"normal"|"night"|"color">(),
  brightnessLevelForMainLighting:new DefaultConverter<number>(),
  brightnessLevelStepForMainLighting:new UnknownConverter<string>(),
  brightnessLevelForNightLighting:new DefaultConverter<number>(),
  brightnessLevelStepForNightLighting:new DefaultConverter<"incandescent"|"white"|"daylightWhite"|"daylightColor"|"other">(),
  lightColorLevelStepForMainLighting:new UnknownConverter<string>(),
  lightColorLevelForNightLighting:new DefaultConverter<"incandescent"|"white"|"daylightWhite"|"daylightColor"|"other">(),
  lightColorLevelStepForNightLighting:new UnknownConverter<string>(),
  autoMode:new DefaultConverter<"normal"|"night"|"off"|"color">(),
  rgb:new UnknownConverter<{red:Number,green:Number,blue:Number}>(),
};
// 電気自動車充電器 eoj:0x02A1
const DefaultevCharger:evChargerConverterType = {
  ratedChargeElectricPower:new DefaultConverter<number>(),
  chargeStatus:new DefaultConverter<"undefined"|"notConnected"|"notChargeable"|"chargeable"|"unknown">(),
  minimumAndMaximumChargingElectricPower:new UnknownConverter<{minimumElectricPower:Number,maximumElectricPower:Number}>(),
  minimumAndMaximumChargingCurrent:new UnknownConverter<{minimumCurrent:Number,maximumCurrent:Number}>(),
  equipmentType:new DefaultConverter<"ac_cplt"|"ac_hlc_charge"|"dc_aa_charge"|"dc_bb_charge"|"dc_ee_charge"|"dc_ff_charge">(),
  chargeableCapacity:new DefaultConverter<number>(),
  remainingChargeableCapacity:new DefaultConverter<number>(),
  usedCapacity1:new DefaultConverter<number>(),
  ratedVoltage:new DefaultConverter<number>(),
  instantaneousElectricPower:new DefaultConverter<number>(),
  cumulativeChargingElectricEnergy:new DefaultConverter<number>(),
  operationMode:new DefaultConverter<"charge"|"standby"|"idle"|"other">(),
  remainingCapacity1:new DefaultConverter<number>(),
  remainingCapacity3:new DefaultConverter<number>(),
  vehicleId:new UnknownConverter<{dataSize:Number,id:string}>(),
  targetChargingElectricEnergy:new DefaultConverter<number>(),
  chargingElectricPower:new DefaultConverter<number>(),
  chargingCurrent:new DefaultConverter<number>(),
};
// 拡張照明システム eoj:0x02A4
const DefaultenhancedLightingSystem:enhancedLightingSystemConverterType = {
  brightness:new DefaultConverter<number>(),
  sceneId:new DefaultConverter<Number|"notSet">(),
  maximumNumberOfSceneId:new DefaultConverter<number>(),
  powerConsumptionRateList:new UnknownConverter<(Number|"unknown")[]>(),
  powerConsumptionAtFullLighting:new DefaultConverter<number>(),
  powerConsumptionWillBeSaved:new DefaultConverter<number>(),
  powerConsumptionLimit:new DefaultConverter<Number|"cancel">(),
  automaticOperationControlling:new DefaultConverter<boolean>(),
  fadingControlChangeTime:new DefaultConverter<number>(),
};
// コントローラ eoj:0x05FF
const Defaultcontroller:controllerConverterType = {
  controllerId:new UnknownConverter<string>(),
  numberOfDevices:new DefaultConverter<number>(),
  deviceList:new UnknownConverter<({deviceId:string,deviceType:string,connection:"connected"|"disconnected"|"notRegistered"|"deleted",manufactureCode:string})[]>(),
};
// 換気扇 eoj:0x0133
const DefaultventilationFan:ventilationFanConverterType = {
  airFlowLevel:new DefaultConverter<Number|"auto">(),
  automaticVentilationOperation:new DefaultConverter<boolean>(),
};
// 空気清浄器 eoj:0x0135
const DefaultairCleaner:airCleanerConverterType = {
  airFlowLevel:new DefaultConverter<Number|"auto">(),
  airPollutionDetection:new DefaultConverter<boolean>(),
  smokeDetection:new DefaultConverter<boolean>(),
  opticalCatalystOperationStatus:new DefaultConverter<boolean>(),
  filterChangeNotice:new DefaultConverter<boolean>(),
};
// 業務用パッケージエアコン室内機 (設備用を除く) eoj:0x0156
const DefaultcommercialAirConditionerIndoorUnit:commercialAirConditionerIndoorUnitConverterType = {
  thermostatState:new DefaultConverter<boolean>(),
  automaticOperationModeStatus:new DefaultConverter<"cooling"|"heating"|"dehumidification"|"circulation"|"other">(),
  operationMode:new DefaultConverter<"auto"|"cooling"|"heating"|"dehumidification"|"circulation">(),
  targetTemperature:new DefaultConverter<number>(),
  roomTemperature:new DefaultConverter<Number|"unmeasurable">(),
  groupInformation:new DefaultConverter<Number|"none">(),
  powerConsumption:new DefaultConverter<"less50W"|"less100W"|"less150W"|"less200W"|"200WOrMore"|"undefined">(),
  groupDeviceList:new UnknownConverter<({deviceId:string,deviceType:string})[]>(),
};
// 業務用パッケージエアコン室外機 (設備用を除く) eoj:0x0157
const DefaultcommercialAirConditionerOutdoorUnit:commercialAirConditionerOutdoorUnitConverterType = {
  specialState:new DefaultConverter<boolean>(),
  ratedPowerConsumption:new UnknownConverter<{cooling:Number|"unsupported",heating:Number|"unsupported"}>(),
  outdoorTemperature:new DefaultConverter<Number|"unmeasurable">(),
  groupInformation:new DefaultConverter<Number|"none">(),
  powerConsumption:new DefaultConverter<number>(),
  powerConsumptionWillBeSaved:new DefaultConverter<number>(),
  powerConsumptionLimit:new DefaultConverter<Number|"canceling">(),
  restrictedMinimumPowerConsumption:new DefaultConverter<number>(),
  groupDeviceList:new UnknownConverter<({deviceId:string,deviceType:string})[]>(),
};
// 電動雨戸・シャッター eoj:0x0263
const DefaultelectricRainDoor:electricRainDoorConverterType = {
  faultDescription:new DefaultConverter<"obstacleCaught"|"outageRecovery"|"timeOut"|"batteryLow">(),
  timerOperationMode:new DefaultConverter<boolean>(),
  openingSpeed:new DefaultConverter<"low"|"medium"|"high">(),
  closingSpeed:new DefaultConverter<"low"|"medium"|"high">(),
  operationTime:new DefaultConverter<number>(),
  openCloseOperation:new DefaultConverter<"open"|"close"|"stop">(),
  degreeOfOpening:new DefaultConverter<number>(),
  blindAngle:new DefaultConverter<number>(),
  openCloseSpeed:new DefaultConverter<"low"|"medium"|"high">(),
  electricLock:new DefaultConverter<boolean>(),
  remoteOperation:new DefaultConverter<boolean>(),
  selectiveDegreeOfOpening:new DefaultConverter<"degreeOfOpening"|"operationTimeOfOpening"|"operationTimeOfClosing"|"localSetting"|"slitDegreeOfOpening">(),
  openCloseStatus:new DefaultConverter<"fullyOpen"|"fullyClosed"|"opening"|"closing"|"stoppedHalfway">(),
  slitDegreeOfOpening:new DefaultConverter<number>(),
  oneTimeOpeningSpeed:new DefaultConverter<"low"|"medium"|"high"|"none">(),
  oneTimeClosingSpeed:new DefaultConverter<"low"|"medium"|"high"|"none">(),
};
// 電気温水器 eoj:0x026B
const DefaultelectricWaterHeater:electricWaterHeaterConverterType = {
  onTimerReservation:new DefaultConverter<boolean>(),
  onTimerTime:new DefaultConverter<string>(),
  automaticWaterHeating:new DefaultConverter<"auto"|"manualNoHeating"|"manualHeating">(),
  automaticWaterHeatingTemperatureControl:new DefaultConverter<boolean>(),
  waterHeatingStatus:new DefaultConverter<boolean>(),
  targetWaterHeatingTemperature:new DefaultConverter<Number|"undefined">(),
  heatingStopDays:new DefaultConverter<Number|"infinite">(),
  relativeTimeHeatingOff:new DefaultConverter<string>(),
  tankOperationMode:new DefaultConverter<"standard"|"saving"|"extra">(),
  daytimeReheatingPermission:new DefaultConverter<boolean>(),
  tankWaterTemperature:new DefaultConverter<number>(),
  alarmStatus:new UnknownConverter<{noHotWater:boolean,leaking:boolean,freezing:boolean}>(),
  hotWaterSupplyStatus:new DefaultConverter<boolean>(),
  relativeTimeKeepingTemperature:new DefaultConverter<string>(),
  energyShiftParticipation:new DefaultConverter<boolean>(),
  standardTimeToStartHeating:new DefaultConverter<string>(),
  numberOfEnergyShifts:new DefaultConverter<number>(),
  waterHeatingShiftTime1:new DefaultConverter<string|"cleared">(),
  estimatedElectricEnergyAtShiftTime1:new UnknownConverter<{at1000:Number,at1300:Number,at1500:Number,at1700:Number}>(),
  electricEnergyConsumptionRate1:new UnknownConverter<{at1000:Number,at1300:Number,at1500:Number,at1700:Number}>(),
  waterHeatingShiftTime2:new DefaultConverter<string|"cleared">(),
  estimatedElectricEnergyAtShiftTime2:new UnknownConverter<{at1300:Number,at1500:Number,at1700:Number}>(),
  electricEnergyConsumptionRate2:new UnknownConverter<{at1300:Number,at1500:Number,at1700:Number}>(),
  targetSuppliedWaterTemperature:new DefaultConverter<number>(),
  targetBathWaterTemperature:new DefaultConverter<number>(),
  bathWaterVolume4:new DefaultConverter<number>(),
  maximumAllowableWaterVolume4:new DefaultConverter<number>(),
  volume:new DefaultConverter<number>(),
  mute:new DefaultConverter<boolean>(),
  remainingWaterVolume:new DefaultConverter<number>(),
  surplusPowerPrediction:new UnknownConverter<{startDateAndTime:string,surplusEnergyPredictionValue:(Number|"invalid")[]}>(),
  winterRatedPower:new DefaultConverter<number>(),
  betweenSeasonRatedPower:new DefaultConverter<number>(),
  summerRatedPower:new DefaultConverter<number>(),
  targetWaterHeatingVolume:new DefaultConverter<number>(),
  remainingWater:new DefaultConverter<number>(),
  tankCapacity:new DefaultConverter<number>(),
  automaticBathOperation:new DefaultConverter<boolean>(),
  bathReheatingOperation:new DefaultConverter<boolean>(),
  bathHotWaterAddition:new DefaultConverter<boolean>(),
  bathLukewarmWaterFunction:new DefaultConverter<boolean>(),
  bathWaterVolume1:new DefaultConverter<number>(),
  bathWaterVolume2:new DefaultConverter<number>(),
  bathroomPriority:new DefaultConverter<boolean>(),
  bathOperationStatusMonitor:new DefaultConverter<"runningHotWater"|"noOperation"|"keepingTemperature">(),
  bathWaterVolume3:new DefaultConverter<number>(),
};
// 電気錠 eoj:0x026F
const DefaultelectricLock:electricLockConverterType = {
  mainElectricLock:new DefaultConverter<boolean>(),
  subElectricLock:new DefaultConverter<boolean>(),
  doorGuardLocked:new DefaultConverter<boolean>(),
  doorOpened:new DefaultConverter<boolean>(),
  occupant:new DefaultConverter<boolean>(),
  alarmStatus:new DefaultConverter<"normal"|"breakOpen"|"doorOpen"|"manualUnlocked"|"tampered">(),
  autoLockMode:new DefaultConverter<boolean>(),
  replaceBatteryLevel:new DefaultConverter<boolean>(),
};
// 浴室暖房乾燥機 eoj:0x0273
const DefaultbathroomHeaterDryer:bathroomHeaterDryerConverterType = {
  onTimerReservation1:new DefaultConverter<boolean>(),
  onTimer:new DefaultConverter<string>(),
  onRelativeTimer:new DefaultConverter<string>(),
  offTimerReservation:new DefaultConverter<boolean>(),
  offTimer:new DefaultConverter<string>(),
  offRelativeTimer:new DefaultConverter<string>(),
  operationSetting:new DefaultConverter<"ventilation"|"prewarming"|"heating"|"drying"|"circulation"|"mistSauna"|"waterMist"|"stop">(),
  ventilationSetting:new DefaultConverter<Number|"auto"|"standard">(),
  bathroomPrewarming:new DefaultConverter<Number|"auto"|"standard">(),
  bathroomHeating:new DefaultConverter<Number|"auto"|"standard">(),
  bathroomDrying:new DefaultConverter<Number|"auto"|"standard">(),
  coolAirCirculation:new DefaultConverter<Number|"auto"|"standard">(),
  mistSauna:new DefaultConverter<Number|"auto"|"standard">(),
  waterMist:new DefaultConverter<Number|"auto"|"standard">(),
  bathroomHumidity:new DefaultConverter<number>(),
  bathroomTemperature:new DefaultConverter<number>(),
  ventilationAirFlowLevel:new DefaultConverter<Number|"auto">(),
  filterCleaningReminderSign:new DefaultConverter<boolean>(),
  humanBodyDetectionStatus:new DefaultConverter<boolean>(),
  onTimerReservation2:new DefaultConverter<"ventilationReservation"|"prewarmingReservation"|"heatingReservation"|"dryingReservation"|"circulationReservation"|"mistSaunaReservation"|"waterMistReservation"|"noReservation">(),
};
// 住宅用太陽光発電 eoj:0x0279
const DefaultpvPowerGeneration:pvPowerGenerationConverterType = {
  outputPowerControl1:new DefaultConverter<number>(),
  outputPowerControl2:new DefaultConverter<number>(),
  surplusPurchaseControl:new DefaultConverter<boolean>(),
  outputPowerControlSchedule:new UnknownConverter<{startDateAndTime:string|"unknown",intervalTime:Number,powerControlRatio:(Number|"undefined")[]}>(),
  updateScheduleDateAndTime:new DefaultConverter<string|"noControlNoSchedule">(),
  surplusPurchaseControlType:new DefaultConverter<boolean>(),
  outputPowerChangeTime:new DefaultConverter<number>(),
  upperLimitClip:new DefaultConverter<number>(),
  operatingPowerFactor:new DefaultConverter<number>(),
  contractType:new DefaultConverter<"fit"|"non_fit"|"undefined">(),
  selfConsumptionType:new DefaultConverter<"withSelfConsumption"|"withoutSelfConsumption"|"unknown">(),
  approvedCapacity:new DefaultConverter<number>(),
  conversionCoefficient:new DefaultConverter<number>(),
  powerSystemInterconnectionStatus:new DefaultConverter<"reversePowerFlowAcceptable"|"independent"|"reversePowerFlowNotAcceptable"|"unknown">(),
  outputPowerRestraintStatus:new DefaultConverter<"outputControl"|"exceptControl"|"reasonUnknown"|"notPowerRestraint"|"unknown">(),
  instantaneousElectricPowerGeneration:new DefaultConverter<number>(),
  cumulativeElectricEnergyOfGeneration:new DefaultConverter<number>(),
  cumulativeElectricEnergySold:new DefaultConverter<number>(),
  powerGenerationOutputLimit1:new DefaultConverter<number>(),
  powerGenerationOutputLimit2:new DefaultConverter<number>(),
  limitElectricEnergySold:new DefaultConverter<number>(),
  ratedElectricPowerOfgeneration:new DefaultConverter<number>(),
  ratedElectricPowerOfgenerationIndependent:new DefaultConverter<number>(),
};
// 床暖房 eoj:0x027B
const DefaultfloorHeater:floorHeaterConverterType = {
  reservationOfOnTimer:new DefaultConverter<"on"|"off">(),
  timeOfOnTimer:new DefaultConverter<string>(),
  relativeTimeOfOnTimer:new DefaultConverter<string>(),
  reservationOfOffTimer:new DefaultConverter<"on"|"off">(),
  timeOfOffTimer:new DefaultConverter<string>(),
  relativeTimeOfOffTimer:new DefaultConverter<string>(),
  maximumTargetTemperature2:new DefaultConverter<number>(),
  targetTemperature1:new DefaultConverter<Number|"auto">(),
  targetTemperature2:new DefaultConverter<Number|"auto">(),
  measuredRoomTemperature:new DefaultConverter<Number|"undefine">(),
  measuredFloorTemperature:new DefaultConverter<Number|"undefine">(),
  controllableZone:new UnknownConverter<(boolean)[]>(),
  specialOperationMode:new DefaultConverter<"normal"|"modest"|"highPower">(),
  dailyTimer:new DefaultConverter<"off"|"timer1"|"timer2">(),
  workedDailyTimer1:new UnknownConverter<({startTime:string,endTime:string})[]>(),
  workedDailyTimer2:new UnknownConverter<({startTime:string,endTime:string})[]>(),
  ratedPowerConsumption:new DefaultConverter<number>(),
  powerMeasurementMethod:new DefaultConverter<"node"|"class"|"instance">(),
};
// 単機能照明 eoj:0x0291
const DefaultmonoFunctionalLighting:monoFunctionalLightingConverterType = {
  brightness:new DefaultConverter<number>(),
};
// 冷凍冷蔵庫 eoj:0x03B7
const Defaultrefrigerator:refrigeratorConverterType = {
  quickFreeze:new DefaultConverter<"normal"|"quick"|"standby">(),
  quickRefrigeration:new DefaultConverter<"normal"|"quick"|"standby">(),
  icemaker:new DefaultConverter<"enable"|"disable"|"standby">(),
  icemakerStatus:new DefaultConverter<"running"|"stopped">(),
  icemakerTankStatus:new DefaultConverter<"normal"|"warning">(),
  refrigeratorHumidification:new DefaultConverter<"on"|"off">(),
  vegetableHumidification:new DefaultConverter<"on"|"off">(),
  deodorization:new DefaultConverter<"on"|"off">(),
  doorOpenCloseStatus:new DefaultConverter<"anyOpen"|"allClose">(),
  doorOpenWarning:new DefaultConverter<boolean>(),
  refrigeratorCompartmentDoorStatus:new DefaultConverter<"open"|"close">(),
  freezerCompartmentDoorStatus:new DefaultConverter<"open"|"close">(),
  iceCompartmentDoorStatus:new DefaultConverter<"open"|"close">(),
  vegetableCompartmentDoorStatus:new DefaultConverter<"open"|"close">(),
  multiModeCompartmentDoorStatus:new DefaultConverter<"open"|"close">(),
  measuredRefrigeratorTemperature:new DefaultConverter<number>(),
  measuredFreezerTemperature:new DefaultConverter<number>(),
  measuredIceTemperature:new DefaultConverter<number>(),
  measuredVegetableTemperature:new DefaultConverter<number>(),
  measuredMultiModeTemperature:new DefaultConverter<number>(),
  compressorRotationSpeed:new UnknownConverter<{maximumRotationSpeed:Number,rotationSpeed:Number}>(),
  electricCurrentConsumption:new DefaultConverter<number>(),
  ratedPowerConsumption:new DefaultConverter<number>(),
  maximumAllowableTemperatureLevel:new UnknownConverter<{refrigeratorCompartmentLevel:Number,freezerCompartmentLevel:Number,iceCompartmentLevel:Number,vegetableCompartmentLevel:Number,multiModeCompartmentLevel:Number}>(),
  refrigeratorTemperature:new DefaultConverter<number>(),
  freezerTemperature:new DefaultConverter<number>(),
  iceTemperature:new DefaultConverter<number>(),
  vegetableTemperature:new DefaultConverter<number>(),
  multiModeTemperature:new DefaultConverter<number>(),
  refrigeratorTemperatureLevel:new DefaultConverter<number>(),
  freezerTemperatureLevel:new DefaultConverter<number>(),
  iceTemperatureLevel:new DefaultConverter<number>(),
  vegetableTemperatureLevel:new DefaultConverter<number>(),
  multiModeTemperatureLevel:new DefaultConverter<number>(),
};
// クッキングヒータ eoj:0x03B9
const DefaultcookingHeater:cookingHeaterConverterType = {
  relativeTimeOfOffTimers:new UnknownConverter<{leftStove:string|"noSetting",rightStove:string|"noSetting",farSideStove:string|"noSetting",roaster:string|"noSetting"}>(),
  childLock:new DefaultConverter<boolean>(),
  radiantHeaterLock:new DefaultConverter<boolean>(),
  heatingStatus:new UnknownConverter<{leftStove:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown",rightStove:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown",farSideStove:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown",roaster:"standingBy"|"operating"|"temporarilyStopped"|"heatingProhibited"|"unknown"}>(),
  heatingOperation:new UnknownConverter<{leftStove:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting",rightStove:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting",farSideStove:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting",roaster:"stopHeating"|"startOrResumeHeating"|"temporarilyStopHeating"|"noSetting"}>(),
  heatingModesOfStoves:new UnknownConverter<{leftStove:"heatingPowerControl"|"deepFryingMode"|"waterHeating"|"riceBoiling"|"stirFrying"|"noSetting",rightStove:"heatingPowerControl"|"deepFryingMode"|"waterHeating"|"riceBoiling"|"stirFrying"|"noSetting",farSideStove:"heatingPowerControl"|"deepFryingMode"|"waterHeating"|"riceBoiling"|"stirFrying"|"noSetting"}>(),
  heatingTemperature:new UnknownConverter<{leftStove:Number|"noSetting",rightStove:Number|"noSetting",farSideStove:Number|"noSetting"}>(),
};
// 炊飯器 eoj:0x03BB
const DefaultriceCooker:riceCookerConverterType = {
  reservation:new DefaultConverter<"on"|"off">(),
  reservationTime:new DefaultConverter<string>(),
  reservationRelativeTime:new DefaultConverter<string>(),
  coverStatus:new DefaultConverter<"open"|"close">(),
  cookingStatus:new DefaultConverter<"stop"|"preheating"|"cooking"|"steaming"|"completion">(),
  cookingControl:new DefaultConverter<"running"|"suspension">(),
  warmerOperation:new DefaultConverter<boolean>(),
  innerPotRemoved:new DefaultConverter<boolean>(),
  coverRemoved:new DefaultConverter<boolean>(),
};
// 業務用ショーケース eoj:0x03CE
const DefaultcommercialShowcase:commercialShowcaseConverterType = {
  operationMode:new DefaultConverter<"cooling"|"nonCooling"|"defrosting"|"other">(),
  dischargeTemperature:new DefaultConverter<number>(),
  groupInformation:new DefaultConverter<Number|"none">(),
  showcaseType:new DefaultConverter<"nonFluorocarbonInverter"|"inverter"|"other">(),
  doorType:new DefaultConverter<"open"|"closed">(),
  refrigeratorType:new DefaultConverter<"separate"|"builtIn">(),
  shapeType:new DefaultConverter<"box"|"desktop"|"tripleGlass"|"quadrupleQuintupleGlass"|"reachIn"|"glassTop"|"multistageOpenAndCeilingBlowoff"|"multistageOpenAndBacksideBlowoff"|"flat"|"walkIn"|"other">(),
  purposeType:new DefaultConverter<"refrigeration"|"freezing">(),
  internalLightingOperationStatus:new DefaultConverter<boolean>(),
  externalLightingOperationStatus:new DefaultConverter<boolean>(),
  compressorOperationStatus:new DefaultConverter<boolean>(),
  internalTemperature:new DefaultConverter<number>(),
  ratedElectricPowerForFreezing:new DefaultConverter<number>(),
  ratedElectricPowerForDefrostingHeater:new DefaultConverter<number>(),
  ratedElectricPowerForFanMotor:new DefaultConverter<number>(),
  heaterOperationStatus:new DefaultConverter<boolean>(),
  insideLightingType:new DefaultConverter<"fluorescent"|"led"|"noLighting"|"other">(),
  outsideLightingType:new DefaultConverter<"fluorescent"|"led"|"noLighting"|"other">(),
  targetInsideBrightness:new DefaultConverter<number>(),
  targetOutsideBrightness:new DefaultConverter<number>(),
  targetInsideTemperature:new DefaultConverter<number>(),
  groupDeviceList:new UnknownConverter<({deviceId:string,deviceType:string})[]>(),
};
// 業務用ショーケース向け室外機 eoj:0x03D4
const DefaultcommercialShowcaseOutdoorUnit:commercialShowcaseOutdoorUnitConverterType = {
  exceptionalStatus:new DefaultConverter<boolean>(),
  operationMode:new DefaultConverter<"cooling"|"nonCooling">(),
  outdoorAirTemperature:new DefaultConverter<number>(),
  groupInformation:new DefaultConverter<Number|"none">(),
  compressorOperationStatus:new DefaultConverter<boolean>(),
  groupDeviceList:new UnknownConverter<({deviceId:string,deviceType:string})[]>(),
};
// スイッチ (JEMA/HA端子対応) eoj:0x05FD
const Defaultswitch:switchConverterType = {
  connectedDevice:new UnknownConverter<string>(),
};
// ハイブリッド給湯機 eoj:0x02A6
const DefaulthybridWaterHeater:hybridWaterHeaterConverterType = {
  automaticWaterHeating:new DefaultConverter<"auto"|"manualNotHeating"|"manualHeating">(),
  waterHeatingStatus:new DefaultConverter<boolean>(),
  heaterStatus:new DefaultConverter<boolean>(),
  hotWaterSupplyModeForAuxiliaryHeatSourceMachine:new DefaultConverter<boolean>(),
  heaterModeForAuxiliaryHeatSourceMachine:new DefaultConverter<boolean>(),
  linkageModeForSolarPowerGeneration:new DefaultConverter<"modeOff"|"householdConsumption"|"prioritizingElectricitySales"|"economicEfficiency">(),
  solarPowerGenerationsUtilizationTime:new UnknownConverter<{startTime:string,endTime:string}>(),
  hotWaterSupplyStatus:new DefaultConverter<boolean>(),
  remainingWater:new DefaultConverter<number>(),
  tankCapacity:new DefaultConverter<number>(),
};
// 洗濯乾燥機 eoj:0x03D3
const DefaultwasherDryer:washerDryerConverterType = {
  onTimerReservationStatus:new DefaultConverter<"enable"|"disable">(),
  onTimerAbsolute:new DefaultConverter<string>(),
  onTimerRelative:new DefaultConverter<number>(),
  doorOpenStatus:new DefaultConverter<"open"|"close">(),
  runningStatus:new DefaultConverter<"run"|"pause"|"stop">(),
  washerDryerCycle1:new DefaultConverter<"washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryIroning"|"washDryHangDrying"|"washDryThick"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washStandard"|"washSilent"|"washHeavilySoiled"|"washHardToRemove"|"washPresoaking"|"washBlankets"|"washSoft"|"washDrymark"|"washCleanRinsing"|"washDisinfection"|"washOilStrains"|"washMemory"|"washDetergentSaving"|"washLightlySoiled"|"washSmallAmountQuick"|"washTankCleaning"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryTankDrying">(),
  washerDryerCycle2:new DefaultConverter<"washDryNoWash"|"washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washDryTankCleaning">(),
  dryerCycle:new DefaultConverter<"dryNoDrying"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryHeaterCurrentLimit"|"dryTankDrying">(),
  washerDryerCycleOptions1:new UnknownConverter<("washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryIroning"|"washDryHangDrying"|"washDryThick"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washStandard"|"washSilent"|"washHeavilySoiled"|"washHardToRemove"|"washPresoaking"|"washBlankets"|"washSoft"|"washDrymark"|"washCleanRinsing"|"washDisinfection"|"washOilStrains"|"washMemory"|"washDetergentSaving"|"washLightlySoiled"|"washSmallAmountQuick"|"washTankCleaning"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryTankDrying")[]>(),
  washerDryerCycleOptions2:new UnknownConverter<("washDryNoWash"|"washDryStandard"|"washDrySilent"|"washDryHeavilySoiled"|"washDryHardToRemove"|"washDryPresoaking"|"washDryBlankets"|"washDrySoft"|"washDryDrymark"|"washDryCleanRinsing"|"washDryDisinfection"|"washDryOilStrains"|"washDryMemory"|"washDryDetergentSaving"|"washDryLightlySoiled"|"washDrySmallAmountQuick"|"washDryTankCleaning")[]>(),
  washerDryerCycleOptions3:new UnknownConverter<("dryNoDrying"|"dryStandard"|"dryBlankets"|"drySoft"|"dryDrymark"|"dryIroning"|"dryHangDrying"|"dryThick"|"dryDisinfection"|"dryShrinkageMinimization"|"dryFinishing"|"dryStationaryDrying"|"dryUserDefinedTime"|"dryWarming"|"dryHeaterCurrentLimit"|"dryTankDrying")[]>(),
  waterFlowRate:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  spinDryingRotationSpeed:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  dryingDegree:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  washingTimeRemaining:new DefaultConverter<Number|"unknown">(),
  dryingTimeRemaining:new DefaultConverter<Number|"unknown">(),
  onTimerElapsed:new DefaultConverter<number>(),
  presoakingTime:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  currentStage:new DefaultConverter<"washing"|"rinsing"|"spinDrying"|"suspended"|"washingCompleted"|"washingDryingCompleted"|"drying"|"wrinkleMinimizing"|"dryingWrinkleMinimizingCompleted"|"standby"|"1stRinsing"|"2ndRinsing"|"3rdRinsing"|"4thRinsing"|"5thRinsing"|"6thRinsing"|"7thRinsing"|"8thRinsing"|"1stSpinDrying"|"2ndSpinDrying"|"3rdSpinDrying"|"4thSpinDrying"|"5thSpinDrying"|"6thSpinDrying"|"7thSpinDrying"|"8thSpinDrying"|"preheatSpinDrying">(),
  waterVolumeByLiter:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  waterVolumeByStep:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  washingTime:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  rinsingCount:new DefaultConverter<Number|"auto">(),
  rinsingProcess:new UnknownConverter<("auto"|"withoutAdditionalWater"|"withAdditionalWater"|"shower")[]>(),
  spinDryingTime:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  dryingTime:new UnknownConverter<{absolute:Number}|{relative:Number}>(),
  waterTemperature:new DefaultConverter<Number|"noWarmWater"|"auto">(),
  bathtubWaterRecycle:new DefaultConverter<"none"|"washing"|"rinsingWithoutFinal"|"rinsing"|"washingRinsingWithoutFinal"|"washingRinsing">(),
  wrinklingMinimization:new DefaultConverter<"enable"|"disable">(),
  washingDryingTimeRemaining:new DefaultConverter<Number|"unknown">(),
  doorLockStatus:new DefaultConverter<boolean>(),
};
// 温度センサ eoj:0x0011
const DefaulttemperatureSensor:temperatureSensorConverterType = {
  value:new DefaultConverter<number>(),
};
// 電力量センサ eoj:0x0022
const DefaultelectricEnergySensor:electricEnergySensorConverterType = {
  cumulativeElectricEnergy:new DefaultConverter<number>(),
  mediumCapacitySensorValue:new DefaultConverter<number>(),
  smallCapacitySensorValue:new DefaultConverter<number>(),
  largeCapacitySensorValue:new DefaultConverter<number>(),
  log:new UnknownConverter<(Number|"noData")[]>(),
  effectiveVoltageValue:new DefaultConverter<number>(),
};
// 電流値センサ eoj:0x0023
const DefaultcurrentSensor:currentSensorConverterType = {
  unsignedValue:new DefaultConverter<number>(),
  ratedVoltage:new DefaultConverter<number>(),
  signedValue:new DefaultConverter<number>(),
};
// 空調換気扇 eoj:0x0134
const DefaultairConditionerVentilationFan:airConditionerVentilationFanConverterType = {
  airFlowLevel:new DefaultConverter<Number|"auto">(),
  ventilationMethod:new DefaultConverter<"blowing"|"airConditioning">(),
  ventilationMode:new DefaultConverter<"normal"|"heatExchange"|"cooling"|"heating"|"dehumidifying"|"humidifying"|"other">(),
  highlowLevel:new DefaultConverter<number>(),
  targetHumidity:new DefaultConverter<number>(),
  currentConsumption:new DefaultConverter<number>(),
  humidity:new DefaultConverter<number>(),
  outdoorTemperature:new DefaultConverter<number>(),
  ventilationAuto:new DefaultConverter<boolean>(),
  co2Concentration:new DefaultConverter<number>(),
  smokeDetection:new DefaultConverter<boolean>(),
  pollutionDetection:new DefaultConverter<boolean>(),
  outdoorHumidity:new DefaultConverter<number>(),
  returnAirTemperature:new UnknownConverter<(Number|"unmeasurable")[]>(),
  returnAirHumidity:new UnknownConverter<(Number|"undefined")[]>(),
  chargingAirTemperature:new DefaultConverter<number>(),
  chargingAirHumidity:new DefaultConverter<number>(),
  dischargingAirTemperature:new DefaultConverter<number>(),
  dischargingAirHumidity:new DefaultConverter<number>(),
  heatExchangerOperationStatus:new DefaultConverter<boolean>(),
};
// 冷温水熱源機 eoj:0x027A
const DefaultcoldOrHotWaterHeatSourceEquipment:coldOrHotWaterHeatSourceEquipmentConverterType = {
  onTimerReservation:new DefaultConverter<boolean>(),
  onTimerTime:new DefaultConverter<string>(),
  onTimerRelativeTime:new DefaultConverter<string>(),
  offTimerReservation:new DefaultConverter<boolean>(),
  offTimerTime:new DefaultConverter<string>(),
  offTimerRelativeTime:new DefaultConverter<string>(),
  coldWaterTemperatue2MaximumLevel:new DefaultConverter<number>(),
  wormWaterTemperatue2MaximumLevel:new DefaultConverter<number>(),
  operationMode:new DefaultConverter<"heating"|"cooling">(),
  waterTemperature1:new DefaultConverter<Number|"auto">(),
  waterTemperature2:new DefaultConverter<Number|Number|"auto">(),
  outwardWaterTemperatureExit:new DefaultConverter<Number|"undefined">(),
  inwardWaterTemperatureEntrance:new DefaultConverter<Number|"undefined">(),
  specialOperation:new DefaultConverter<"normal"|"modest"|"highPower">(),
  dailyTimer:new DefaultConverter<"timerMode"|"timer1"|"timer2">(),
  dailyTimer1:new UnknownConverter<string>(),
  dailyTimer2:new UnknownConverter<string>(),
  ratedPowerconsumption:new UnknownConverter<{heating:Number,cooling:Number}>(),
  powerConsumptionMeasurementMethod:new DefaultConverter<"nodeUnit"|"classUnit"|"instanceUnit">(),
};
// 電力量メータ eoj:0x0280
const DefaultwattHourMeter:wattHourMeterConverterType = {
  cumulativeElectricEnergy:new DefaultConverter<number>(),
  cumulativeElectricEnergyLog1:new UnknownConverter<(Number|"noData")[]>(),
};
// 分電盤メータリング eoj:0x0287
const DefaultpowerDistributionBoardMetering:powerDistributionBoardMeteringConverterType = {
  masterRatedCapacity:new DefaultConverter<number>(),
  numberOfMeasurementChannelsSimplex:new DefaultConverter<Number|"undefined">(),
  cumulativeElectricEnergyListSimplex:new UnknownConverter<{startChannel:Number|"undefined",range:Number|"undefined",electricEnergy:(Number|"noData")[]}>(),
  instantaneousCurrentListSimplex:new UnknownConverter<{startChannel:Number|"undefined",range:Number|"undefined",instantaneousCurrent:({rPhase:Number|"noData",tPhase:Number|"noData"})[]}>(),
  instantaneousElectricPowerListSimplex:new UnknownConverter<{startChannel:Number|"undefined",range:Number|"undefined",instantaneousElectricPower:(Number|"noData")[]}>(),
  numberOfMeasurementChannelsDuplex:new DefaultConverter<Number|"undefined">(),
  cumulativeElectricEnergyListDuplex:new UnknownConverter<{startChannel:Number|"undefined",range:Number|"undefined",electricEnergy:({normalDirectionElectricEnergy:Number|"noData",reverseDirectionElectricEnergy:Number|"noData"})[]}>(),
  instantaneousCurrentListDuplex:new UnknownConverter<{startChannel:Number|"undefined",range:Number|"undefined",instantaneousCurrent:({rPhase:Number|"noData",tPhase:Number|"noData"})[]}>(),
  instantaneousElectricPowerListDuplex:new UnknownConverter<{startChannel:Number|"undefined",range:Number|"undefined",instantaneousElectricPower:(Number|"noData")[]}>(),
  normalDirectionCumulativeElectricEnergy:new DefaultConverter<Number|"noData">(),
  reverseDirectionCumulativeElectricEnergy:new DefaultConverter<Number|"noData">(),
  normalDirectionCumulativeElectricEnergyLog:new UnknownConverter<{day:Number|"defaultValue",electricEnergy:(Number|"noData")[]}>(),
  reverseDirectionCumulativeElectricEnergyLog:new UnknownConverter<{day:Number|"defaultValue",electricEnergy:(Number|"noData")[]}>(),
  instantaneousElectricPower:new DefaultConverter<Number|"noData">(),
  instantaneousCurrent:new UnknownConverter<{rPhase:Number|"noData",tPhase:Number|"noData"}>(),
  instantaneousVoltage:new UnknownConverter<{rS:Number,sT:Number}>(),
  measurementChannel1:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel2:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel3:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel4:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel5:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel6:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel7:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel8:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel9:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel10:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel11:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel12:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel13:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel14:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel15:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel16:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel17:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel18:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel19:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel20:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel21:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel22:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel23:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel24:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel25:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel26:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel27:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel28:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel29:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel30:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel31:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
  measurementChannel32:new UnknownConverter<{electricEnergy:Number|"noData",currentRphase:Number|"noData",currentTphase:Number|"noData"}>(),
};
// テレビ eoj:0x0602
const Defaulttv:tvConverterType = {
  displayControlStatus:new DefaultConverter<"enabled"|"disabled">(),
  stringSettingAcceptanceStatus:new DefaultConverter<"ready"|"busy">(),
  supportedCharacterCode:new UnknownConverter<{ansi_x3_4:"notImplemented"|"implemented",shift_jis:"notImplemented"|"implemented",jis:"notImplemented"|"implemented",japanese_euc:"notImplemented"|"implemented",ucs_4:"notImplemented"|"implemented",ucs_2:"notImplemented"|"implemented",latin_1:"notImplemented"|"implemented",utf_8:"notImplemented"|"implemented"}>(),
  characterStringPresented:new UnknownConverter<{length:Number,characterCode:{ansi_x3_4:"notImplemented"|"implemented",shift_jis:"notImplemented"|"implemented",jis:"notImplemented"|"implemented",japanese_euc:"notImplemented"|"implemented",ucs_4:"notImplemented"|"implemented",ucs_2:"notImplemented"|"implemented",latin_1:"notImplemented"|"implemented",utf_8:"notImplemented"|"implemented"}}>(),
  lengthOfStringAccepted:new UnknownConverter<{length:Number}>(),
};
export interface CustomAllConvertersType {
  common : Partial<commonConverterType>;
  homeAirConditioner : Partial<homeAirConditionerConverterType>;
  instantaneousWaterHeater : Partial<instantaneousWaterHeaterConverterType>;
  fuelCell : Partial<fuelCellConverterType>;
  storageBattery : Partial<storageBatteryConverterType>;
  evChargerDischarger : Partial<evChargerDischargerConverterType>;
  lvSmartElectricEnergyMeter : Partial<lvSmartElectricEnergyMeterConverterType>;
  hvSmartElectricEnergyMeter : Partial<hvSmartElectricEnergyMeterConverterType>;
  generalLighting : Partial<generalLightingConverterType>;
  evCharger : Partial<evChargerConverterType>;
  enhancedLightingSystem : Partial<enhancedLightingSystemConverterType>;
  controller : Partial<controllerConverterType>;
  ventilationFan : Partial<ventilationFanConverterType>;
  airCleaner : Partial<airCleanerConverterType>;
  commercialAirConditionerIndoorUnit : Partial<commercialAirConditionerIndoorUnitConverterType>;
  commercialAirConditionerOutdoorUnit : Partial<commercialAirConditionerOutdoorUnitConverterType>;
  electricRainDoor : Partial<electricRainDoorConverterType>;
  electricWaterHeater : Partial<electricWaterHeaterConverterType>;
  electricLock : Partial<electricLockConverterType>;
  bathroomHeaterDryer : Partial<bathroomHeaterDryerConverterType>;
  pvPowerGeneration : Partial<pvPowerGenerationConverterType>;
  floorHeater : Partial<floorHeaterConverterType>;
  monoFunctionalLighting : Partial<monoFunctionalLightingConverterType>;
  refrigerator : Partial<refrigeratorConverterType>;
  cookingHeater : Partial<cookingHeaterConverterType>;
  riceCooker : Partial<riceCookerConverterType>;
  commercialShowcase : Partial<commercialShowcaseConverterType>;
  commercialShowcaseOutdoorUnit : Partial<commercialShowcaseOutdoorUnitConverterType>;
  switch : Partial<switchConverterType>;
  hybridWaterHeater : Partial<hybridWaterHeaterConverterType>;
  washerDryer : Partial<washerDryerConverterType>;
  temperatureSensor : Partial<temperatureSensorConverterType>;
  electricEnergySensor : Partial<electricEnergySensorConverterType>;
  currentSensor : Partial<currentSensorConverterType>;
  airConditionerVentilationFan : Partial<airConditionerVentilationFanConverterType>;
  coldOrHotWaterHeatSourceEquipment : Partial<coldOrHotWaterHeatSourceEquipmentConverterType>;
  wattHourMeter : Partial<wattHourMeterConverterType>;
  powerDistributionBoardMetering : Partial<powerDistributionBoardMeteringConverterType>;
  tv : Partial<tvConverterType>;
}
export interface AllConvertersType {
  common : commonConverterType;
  homeAirConditioner : homeAirConditionerConverterType;
  instantaneousWaterHeater : instantaneousWaterHeaterConverterType;
  fuelCell : fuelCellConverterType;
  storageBattery : storageBatteryConverterType;
  evChargerDischarger : evChargerDischargerConverterType;
  lvSmartElectricEnergyMeter : lvSmartElectricEnergyMeterConverterType;
  hvSmartElectricEnergyMeter : hvSmartElectricEnergyMeterConverterType;
  generalLighting : generalLightingConverterType;
  evCharger : evChargerConverterType;
  enhancedLightingSystem : enhancedLightingSystemConverterType;
  controller : controllerConverterType;
  ventilationFan : ventilationFanConverterType;
  airCleaner : airCleanerConverterType;
  commercialAirConditionerIndoorUnit : commercialAirConditionerIndoorUnitConverterType;
  commercialAirConditionerOutdoorUnit : commercialAirConditionerOutdoorUnitConverterType;
  electricRainDoor : electricRainDoorConverterType;
  electricWaterHeater : electricWaterHeaterConverterType;
  electricLock : electricLockConverterType;
  bathroomHeaterDryer : bathroomHeaterDryerConverterType;
  pvPowerGeneration : pvPowerGenerationConverterType;
  floorHeater : floorHeaterConverterType;
  monoFunctionalLighting : monoFunctionalLightingConverterType;
  refrigerator : refrigeratorConverterType;
  cookingHeater : cookingHeaterConverterType;
  riceCooker : riceCookerConverterType;
  commercialShowcase : commercialShowcaseConverterType;
  commercialShowcaseOutdoorUnit : commercialShowcaseOutdoorUnitConverterType;
  switch : switchConverterType;
  hybridWaterHeater : hybridWaterHeaterConverterType;
  washerDryer : washerDryerConverterType;
  temperatureSensor : temperatureSensorConverterType;
  electricEnergySensor : electricEnergySensorConverterType;
  currentSensor : currentSensorConverterType;
  airConditionerVentilationFan : airConditionerVentilationFanConverterType;
  coldOrHotWaterHeatSourceEquipment : coldOrHotWaterHeatSourceEquipmentConverterType;
  wattHourMeter : wattHourMeterConverterType;
  powerDistributionBoardMetering : powerDistributionBoardMeteringConverterType;
  tv : tvConverterType;
}
export const DefaultConverters : AllConvertersType = {
  common : Defaultcommon,
  homeAirConditioner : DefaulthomeAirConditioner,
  instantaneousWaterHeater : DefaultinstantaneousWaterHeater,
  fuelCell : DefaultfuelCell,
  storageBattery : DefaultstorageBattery,
  evChargerDischarger : DefaultevChargerDischarger,
  lvSmartElectricEnergyMeter : DefaultlvSmartElectricEnergyMeter,
  hvSmartElectricEnergyMeter : DefaulthvSmartElectricEnergyMeter,
  generalLighting : DefaultgeneralLighting,
  evCharger : DefaultevCharger,
  enhancedLightingSystem : DefaultenhancedLightingSystem,
  controller : Defaultcontroller,
  ventilationFan : DefaultventilationFan,
  airCleaner : DefaultairCleaner,
  commercialAirConditionerIndoorUnit : DefaultcommercialAirConditionerIndoorUnit,
  commercialAirConditionerOutdoorUnit : DefaultcommercialAirConditionerOutdoorUnit,
  electricRainDoor : DefaultelectricRainDoor,
  electricWaterHeater : DefaultelectricWaterHeater,
  electricLock : DefaultelectricLock,
  bathroomHeaterDryer : DefaultbathroomHeaterDryer,
  pvPowerGeneration : DefaultpvPowerGeneration,
  floorHeater : DefaultfloorHeater,
  monoFunctionalLighting : DefaultmonoFunctionalLighting,
  refrigerator : Defaultrefrigerator,
  cookingHeater : DefaultcookingHeater,
  riceCooker : DefaultriceCooker,
  commercialShowcase : DefaultcommercialShowcase,
  commercialShowcaseOutdoorUnit : DefaultcommercialShowcaseOutdoorUnit,
  switch : Defaultswitch,
  hybridWaterHeater : DefaulthybridWaterHeater,
  washerDryer : DefaultwasherDryer,
  temperatureSensor : DefaulttemperatureSensor,
  electricEnergySensor : DefaultelectricEnergySensor,
  currentSensor : DefaultcurrentSensor,
  airConditionerVentilationFan : DefaultairConditionerVentilationFan,
  coldOrHotWaterHeatSourceEquipment : DefaultcoldOrHotWaterHeatSourceEquipment,
  wattHourMeter : DefaultwattHourMeter,
  powerDistributionBoardMetering : DefaultpowerDistributionBoardMetering,
  tv : Defaulttv,
};
