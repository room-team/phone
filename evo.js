
	// SensorTag object.
	var sensortag
	var capturedData = {
		magnetX: ''
	}

	function initialiseSensorTag()
	{
		// Create SensorTag CC2650 instance.
		sensortag = evothings.tisensortag.createInstance(
			evothings.tisensortag.CC2650_BLUETOOTH_SMART)

		// Uncomment to use SensorTag CC2541.
		//sensortag = evothings.tisensortag.createInstance(
		//	evothings.tisensortag.CC2541_BLUETOOTH_SMART)

		//
		// Here sensors are set up.
		//
		// If you wish to use only one or a few sensors, just set up
		// the ones you wish to use.
		//
		// First parameter to sensor function is the callback function.
		// Several of the sensors take a millisecond update interval
		// as the second parameter.
		//
		sensortag
			.statusCallback(statusHandler)
			.errorCallback(errorHandler)
			.keypressCallback(keypressHandler)
			.temperatureCallback(temperatureHandler, 1000)
			.humidityCallback(humidityHandler, 1000)
			.barometerCallback(barometerHandler, 1000)
			.accelerometerCallback(accelerometerHandler, 1000)
			.magnetometerCallback(magnetometerHandler, 1000)
			.gyroscopeCallback(gyroscopeHandler, 1000)
			.luxometerCallback(luxometerHandler, 1000)
	}
	
	///////////////////////////////////////////////////////////////////////////////////////THIS IS MY OWN COOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOODE
	var whatever = {
		this: "thasef"
	}
	
	function getNum(){
		document.getElementById("customButton").innerHTML = whatever.this;
	}
	///////////////////////////////////////////////////////////////////////////////////////THIS IS MY OWN COOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOODE

	function connect()
	{
		sensortag.connectToNearestDevice()
	}

	function disconnect()
	{
		sensortag.disconnectDevice()
		resetSensorDisplayValues()
	}

	var sensorsOn = true

	function toggleSensors()
	{
		if(sensorsOn)
		{
			sensortag.keypressOff()
			sensortag.temperatureOff()
			sensortag.humidityOff()
			sensortag.barometerOff()
			sensortag.accelerometerOff()
			sensortag.magnetometerOff()
			sensortag.gyroscopeOff()
			sensortag.luxometerOff()
			sensorsOn = false
		}
		else
		{
			sensortag.keypressOn()
			sensortag.temperatureOn()
			sensortag.humidityOn()
			sensortag.barometerOn()
			sensortag.accelerometerOn()
			sensortag.magnetometerOn()
			sensortag.gyroscopeOn()
			sensortag.luxometerOn()
			sensorsOn = true
		}
	}

	function statusHandler(status)
	{
		if ('DEVICE_INFO_AVAILABLE' == status)
		{
			// Show a notification about that the firmware should be
			// upgraded if the connected device is a SensorTag CC2541
			// with firmware revision less than 1.5, since this the
			// SensorTag library does not support these versions.
			var upgradeNotice = document.getElementById('upgradeNotice')
			if ('CC2541' == sensortag.getDeviceModel() &&
				parseFloat(sensortag.getFirmwareString()) < 1.5)
			{
				upgradeNotice.classList.remove('hidden')
			}
			else
			{
				upgradeNotice.classList.add('hidden')
			}

			// Show device model and firmware version.
			displayValue('DeviceModel', sensortag.getDeviceModel())
			displayValue('FirmwareData', sensortag.getFirmwareString())

			// Show which sensors are not supported by the connected SensorTag.
			if (!sensortag.isLuxometerAvailable())
			{
				document.getElementById('Luxometer').style.display = 'none'
			}
		}

		displayValue('StatusData', status)
	}

	function errorHandler(error)
	{
		console.log('Error: ' + error)

		if (evothings.easyble.error.DISCONNECTED == error)
		{
			resetSensorDisplayValues()
		}
		else
		{
			displayValue('StatusData', 'Error: ' + error)
		}
	}

	function resetSensorDisplayValues()
	{
		// Clear current values.
		var blank = '[Waiting for value]'
		displayValue('StatusData', 'Press Connect to find a SensorTag')
		displayValue('DeviceModel', '?')
		displayValue('FirmwareData', '?')
		displayValue('KeypressData', blank)
		displayValue('TemperatureData', blank)
		displayValue('AccelerometerData', blank)
		displayValue('HumidityData', blank)
		displayValue('MagnetometerData', blank)
		displayValue('BarometerData', blank)
		displayValue('GyroscopeData', blank)
		displayValue('LuxometerData', blank)

		// Reset screen color.
		setBackgroundColor('white')
	}

	function keypressHandler(data)
	{
		// Update background color.
		switch (data[0])
		{
			case 0:
				setBackgroundColor('white')
				break;
			case 1:
				setBackgroundColor('red')
				break;
			case 2:
				setBackgroundColor('blue')
				break;
			case 3:
				setBackgroundColor('magenta')
				break;
		}

		// Update the value displayed.
		var string = 'raw: 0x' + bufferToHexStr(data, 0, 1)
		displayValue('KeypressData', string)
	}

	function temperatureHandler(data)
	{
		// Calculate temperature from raw sensor data.
		var values = sensortag.getTemperatureValues(data)
		var ac = values.ambientTemperature
		var af = sensortag.celsiusToFahrenheit(ac)
		var tc = values.targetTemperature
		var tf = sensortag.celsiusToFahrenheit(tc)

		// Prepare the information to display.
		var string =
			//'raw: <span style="font-family: monospace;">0x' +
			//	bufferToHexStr(data, 0, 4) + '</span><br/>' +
			(tc >= 0 ? '+' : '') + tc.toFixed(2) + '&deg; C ' +
			'(' + (tf >= 0 ? '+' : '') + tf.toFixed(2) + '&deg; F)' + '<br/>' +
			(ac >= 0 ? '+' : '') + ac.toFixed(2) + '&deg; C ' +
			'(' + (af >= 0 ? '+' : '') + af.toFixed(2) + '&deg; F) [amb]' +
			'<br/>'

		// Update the value displayed.
		displayValue('TemperatureData', string)
	}

	function accelerometerHandler(data)
	{
		// Calculate the x,y,z accelerometer values from raw data.
		var values = sensortag.getAccelerometerValues(data)
		var x = values.x
		var y = values.y
		var z = values.z

		//var model = sensortag.getDeviceModel()
		//var dataOffset = (model == 2 ? 6 : 0)

		// Prepare the information to display.
		string =
			//'raw: <span style="font-family: monospace;">0x' +
			//	bufferToHexStr(data, dataOffset, 6) + '</span><br/>' +
			'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + 'G<br/>' +
			'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + 'G<br/>' +
			'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + 'G<br/>'

		// Update the value displayed.
		displayValue('AccelerometerData', string)
	}

	function humidityHandler(data)
	{
		// Calculate the humidity values from raw data.
		var values = sensortag.getHumidityValues(data)

		// Calculate the humidity temperature (C and F).
		var tc = values.humidityTemperature
		var tf = sensortag.celsiusToFahrenheit(tc)

		// Calculate the relative humidity.
		var h = values.relativeHumidity

		// Prepare the information to display.
		string =
			//'raw: <span style="font-family: monospace;">0x' +
			//	bufferToHexStr(data, 0, 4) + '</span><br/>'
			(tc >= 0 ? '+' : '') + tc.toFixed(2) + '&deg; C ' +
			'(' + (tf >= 0 ? '+' : '') + tf.toFixed(2) + '&deg; F)' + '<br/>' +
			(h >= 0 ? '+' : '') + h.toFixed(2) + '% RH' + '<br/>'

		// Update the value displayed.
		displayValue('HumidityData', string)
	}

	function magnetometerHandler(data)
	{
		// Calculate the magnetometer values from raw sensor data.
		var values = sensortag.getMagnetometerValues(data)
		var x = values.x
		var y = values.y
		var z = values.z

		//var model = sensortag.getDeviceModel()
		//var dataOffset = (model == 2 ? 12 : 0)

		// Prepare the information to display.
		string =
			//'raw: <span style="font-family: monospace;">0x' +
			//	bufferToHexStr(data, dataOffset, 6) + '</span><br/>' +
			'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + '&micro;T <br/>(' + sensortag.magClosedX + ', ' +
			sensortag.magHalfX + ', ' +
			sensortag.magOpenX + ')<br/>' +
			'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + '&micro;T <br/>(' + sensortag.magClosedY + ', ' +
			sensortag.magHalfY + ', ' +
			sensortag.magOpenY + ')<br/>' +
			'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + '&micro;T <br/>(' + sensortag.magClosedZ + ', ' +
			sensortag.magHalfZ + ', ' +
			sensortag.magOpenZ + ')<br/>'

		var distClosed = Math.abs(x - sensortag.magClosedX) + Math.abs(y - sensortag.magClosedY) + Math.abs(z - sensortag.magClosedZ);
		var distHalf = Math.abs(x - sensortag.magHalfX) + Math.abs(y - sensortag.magHalfY) + Math.abs(z - sensortag.magHalfZ);
		var distOpen = Math.abs(x - sensortag.magOpenX) + Math.abs(y - sensortag.magOpenY) + Math.abs(z - sensortag.magOpenZ);

		if(distClosed < distHalf && distClosed < distOpen){
			string += 'We are closed';
		} else if (distOpen < distHalf && distOpen < distClosed){
			string += 'We are open';
		} else if (distHalf < distOpen && distHalf < distClosed){
			string += 'We are half open';
		} else {
			string += 'We are not sure';
		}

		// Update the value displayed.
		displayValue('MagnetometerData', string)
	}

	function calibrateClosed(){
		var values = sensortag.lastMagData;
		var x = values.x
		var y = values.y
		var z = values.z
		sensortag.magClosedX = x
		sensortag.magClosedY = y
		sensortag.magClosedZ = z
	}

	function calibrateOpen(){
		var values = sensortag.lastMagData
		var x = values.x
		var y = values.y
		var z = values.z
		sensortag.magOpenX = x
		sensortag.magOpenY = y
		sensortag.magOpenZ = z
	}

	function calibrateHalf(){
		var values = sensortag.lastMagData
		var x = values.x
		var y = values.y
		var z = values.z
		sensortag.magHalfX = x
		sensortag.magHalfY = y
		sensortag.magHalfZ = z
	}

	function barometerHandler(data)
	{
		// Calculate pressure from raw sensor data.
		var values = sensortag.getBarometerValues(data)
		var pressure = values.pressure

		// Prepare the information to display.
		string =
			//'raw: <span style="font-family: monospace;">0x' +
			//	bufferToHexStr(data, 0, 4) + '</span><br/>' +
			'Pressure: ' + pressure.toPrecision(5) + ' mbar<br/>'

		// Update the value displayed.
		displayValue('BarometerData', string)
	}

	function gyroscopeHandler(data)
	{
		// Calculate the gyroscope values from raw sensor data.
		var values = sensortag.getGyroscopeValues(data)
		var x = values.x
		var y = values.y
		var z = values.z

		// Prepare the information to display.
		string =
			//'raw: <span style="font-family: monospace;">0x' +
			//	bufferToHexStr(data, 0, 6) + '</span><br/>' +
			'x: ' + (x >= 0 ? '+' : '') + x.toFixed(5) + '<br/>' +
			'y: ' + (y >= 0 ? '+' : '') + y.toFixed(5) + '<br/>' +
			'z: ' + (z >= 0 ? '+' : '') + z.toFixed(5) + '<br/>'

		// Update the value displayed.
		displayValue('GyroscopeData', string)
		
	}

	function luxometerHandler(data)
	{
		var value = sensortag.getLuxometerValue(data)

		// Prepare the information to display.
		string = ''
			//'raw: <span style="font-family: monospace;">0x' +
			//	bufferToHexStr(data, 0, 2) + '</span><br/>' +
			'Light level: ' + value.toPrecision(5) + ' lux<br/>'

		if(value < 5){
			string = 'Lights off'
		} else if (value < 15){
			string = 'Projector on'
		} else if (value < 50){
			string = 'Lights dim'
		} else {
			string = 'Lights on'
		}
		
		string += ' (' + value.toPrecision(5) + ' lux)<br/>'

		// Update the value displayed.
		displayValue('LuxometerData', string)
	}

	function displayValue(elementId, value)
	{
		document.getElementById(elementId).innerHTML = value
	}

	function setBackgroundColor(color)
	{
		document.documentElement.style.background = color
		document.body.style.background = color
	}

	/**
	 * Convert byte buffer to hex string.
	 * @param buffer - an Uint8Array
	 * @param offset - byte offset
	 * @param numBytes - number of bytes to read
	 * @return string with hex representation of bytes
	 */
	function bufferToHexStr(buffer, offset, numBytes)
	{
		var hex = ''
		for (var i = 0; i < numBytes; ++i)
		{
			hex += byteToHexStr(buffer[offset + i])
		}
		return hex
	}

	/**
	 * Convert byte number to hex string.
	 */
	function byteToHexStr(d)
	{
		if (d < 0) { d = 0xFF + d + 1 }
		var hex = Number(d).toString(16)
		var padding = 2
		while (hex.length < padding)
		{
			hex = '0' + hex
		}
		return hex
	}

	document.addEventListener(
		'deviceready',
		function() { evothings.scriptsLoaded(initialiseSensorTag) },
		false)