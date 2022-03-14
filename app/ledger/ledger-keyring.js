import AppEth from '@ledgerhq/hw-app-eth';
import ledgerService from '@ledgerhq/hw-app-eth/lib/services/ledger';
import { rlp, addHexPrefix } from 'ethereumjs-util';
import HDKey from 'hdkey';
import { TransactionFactory } from '@ethereumjs/tx';

const hdPathString = `m/44'/60'/0`;
const type = 'Ledger';

export default class LedgerKeyring {
	static type = type;

	constructor(opts = {}) {
		this.deserialize(opts);
		this.hdk = new HDKey();
		this.type = type;
		this.unlockedAccountIndex = 0;
		this.addressToHDPath = {};
	}

	serialize = async () => ({
		hdPath: this.hdPath,
		accounts: this.accounts,
		unlockedAccountIndex: this.unlockedAccountIndex,
		addressToHDPath: this.addressToHDPath,
	});

	deserialize = async ({ hdPath, accounts, unlockedAccountIndex, addressToHDPath }) => {
		this.hdPath = hdPath || hdPathString;
		this.accounts = accounts || [];
		this.unlockedAccountIndex = unlockedAccountIndex || 0;
		this.addressToHDPath = addressToHDPath || {};
	};

	getAccounts = async () => {
		const accounts = [...this.accounts];
		return accounts;
	};

	getName = () => type;

	setAccountToUnlock = (accountIndex) => {
		this.unlockedAccountIndex = accountIndex;
	};

	addAccounts = async (n = 1) => {
		const from = this.unlockedAccountIndex;

		for (let i = from; i < n; i++) {
			const path = `m/44'/60'/${i}'/0/0`;
			const address = await this.unlock(path);
			if (!this.accounts.includes(address)) {
				this.accounts.push(address);
				this.unlockedAccountIndex++;
			}

			this.addressToHDPath[address] = path;
		}

		return this.accounts;
	};

	getFirstPage = async () => {
		const page = await this.addAccounts(5);
		return page;
	};

	unlock = async (hdPath) => {
		const account = await this.app.getAddress(hdPath, false, true);
		// eslint-disable-next-line no-undef
		this.hdk.publicKey = Buffer.from(account.publicKey, 'hex');
		// eslint-disable-next-line no-undef
		this.hdk.chainCode = Buffer.from(account.chainCode, 'hex');
		return account.address;
	};

	setTransport = (transport) => {
		this.transport = transport;
		this.app = new AppEth(this.transport);
	};

	_getHDPathFromAddress = async (address) => {
		const key = Object.keys(this.addressToHDPath).find((key) => key.toLowerCase() === address.toLowerCase());

		const hdPath = this.addressToHDPath[key];

		if (typeof hdPath === 'undefined') {
			throw new Error('Unknown address');
		}

		return hdPath;
	};

	signTransaction = async (address, tx) => {
		const hdPath = await this._getHDPathFromAddress(address);

		// console.log(Object.keys(ethUtil).map((x) => `${x}\n`));

		console.log('signTransaction.tx', JSON.stringify(tx, null, 4));

		// `getMessageToSign` will return valid RLP for all transaction types
		const messageToSign = tx.getMessageToSign(false);
		console.log('**** signTransaction.messageToSign', messageToSign);

		const rawTxHex = global.Buffer.isBuffer(messageToSign)
			? messageToSign.toString('hex')
			: rlp.encode(messageToSign).toString('hex');

		const resolution = await ledgerService.resolveTransaction(rawTxHex);

		const { r, s, v } = await this.app.signTransaction(hdPath, rawTxHex, resolution);

		// Because tx will be immutable, first get a plain javascript object that
		// represents the transaction. Using txData here as it aligns with the
		// nomenclature of ethereumjs/tx.
		const txData = tx.toJSON();

		// The fromTxData utility expects a type to support transactions with a type other than 0
		txData.type = tx.type;

		// The fromTxData utility expects v,r and s to be hex prefixed
		txData.v = addHexPrefix(v);
		txData.r = addHexPrefix(r);
		txData.s = addHexPrefix(s);

		// Adopt the 'common' option from the original transaction and set the
		// returned object to be frozen if the original is frozen.
		const transaction = TransactionFactory.fromTxData(txData, { common: tx.common, freeze: Object.isFrozen(tx) });

		console.log('***** signTransaction.transaction', transaction);

		return transaction;
	};
}
