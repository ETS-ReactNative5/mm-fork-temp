import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Observable } from 'rxjs';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';
import DeviceItem from './DeviceItem';

//eslint-disable-next-line
const SelectDevice = ({ onDeviceSelected }) => {
	const [devices, setDevices] = useState([]);
	const [error, setError] = useState(null);
	const [refreshing, setRefreshing] = useState(false);
	const [_subscription, setSubscription] = useState(null);

	const startScan = () => {
		setRefreshing(true);

		const subscription = new Observable(TransportBLE.listen).subscribe({
			complete: () => setRefreshing(false),
			next: (e) => {
				const deviceFound = devices.some((i) => i.id === device.id);
				e.type === 'add' && !deviceFound && setDevices([...devices, e.descriptor]);
			},
			error: (error) => {
				setError(error);
				setRefreshing(false);
			},
		});

		return subscription;
	};

	// const reload = useCallback(async () => {
	// 	if (subscription) subscription.unsubscribe();

	// 	setDevices([]);
	// 	setError(null);
	// 	setRefreshing(false);

	// 	const sub = await startScan();
	// 	return sub;
	// }, [subscription]);

	useEffect(() => {
		const subscription = startScan();
		setSubscription(subscription);

		// new Observable(TransportBLE.observeState).subscribe(async (e) => {
		// 	if (e.available !== previousAvailable) {
		// 		previousAvailable = e.available;
		// 		if (e.available) {
		// 			const sub = await reload();
		// 			if (sub) setSubscription(sub);
		// 		}
		// 	}
		// });

		return () => {
			subscription && subscription.unsubscribe();
		};
	}, []);

	const onSelect = async (device) => {
		try {
			await onDeviceSelected(device);
		} catch (error) {
			setError(error);
		}
	};

	// eslint-disable-next-line
	const renderItem = ({ item }) => <DeviceItem device={item} onSelect={onSelect} />;

	const ListHeader = () =>
		error ? (
			<View>
				<Text>Sorry, an error occured</Text>
				<Text>{String(error.message)}</Text>
			</View>
		) : (
			<View>
				<Text>Scanning for Bluetooth...</Text>
				<Text>Power up your Ledger Nano X and enter your pin.</Text>
			</View>
		);

	return (
		<FlatList
			extraData={error}
			data={devices}
			renderItem={renderItem}
			keyExtractor={(item) => item.id} //eslint-disable-line
			ListHeaderComponent={ListHeader}
			// onRefresh={reload}
			refreshing={refreshing}
		/>
	);
};

export default SelectDevice;
