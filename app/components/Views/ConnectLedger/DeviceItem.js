import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';

const DeviceItem = ({ onSelect, device }) => {
	const [pending, setPending] = useState(false);

	const onPress = async () => {
		setPending(true);
		await onSelect(device);
		setPending(false);
	};

	return (
		<TouchableOpacity onPress={onPress} disabled={pending}>
			<Text>{device.name}</Text>
			{pending ? <ActivityIndicator /> : null}
		</TouchableOpacity>
	);
};

DeviceItem.propTypes = {
	onSelect: PropTypes.func.isRequired,
	device: PropTypes.object.isRequired,
};

export default DeviceItem;
