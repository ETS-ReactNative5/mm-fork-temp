import React, { useState } from 'react';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import SelectDevice from './SelectDevice';
import DisplayAddress from './DisplayAddress';

const ConnectLedger = () => {
	const [transport, setTransport] = useState(null);

	const onDeviceSelected = async (device) => {
		const bleTransport = await TransportBLE.open(device);

		bleTransport.on('disconnect', () => {
			setTransport(null);
		});

		setTransport(bleTransport);
	};

	if (!transport) {
		return <SelectDevice onDeviceSelected={onDeviceSelected} />;
	}

	return <DisplayAddress transport={transport} />;
};

export default ConnectLedger;
