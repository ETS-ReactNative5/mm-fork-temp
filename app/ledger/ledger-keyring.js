import AppEth from '@ledgerhq/hw-app-eth';
import ledgerService from '@ledgerhq/hw-app-eth/lib/services/ledger';
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

		console.log('signTransaction.tx', JSON.stringify(tx, null, 4));

		const serializedTx = tx.serialize().toString('hex');
		console.log('***** signTransaction.serializedTx', serializedTx);

		const resolution = await ledgerService.resolveTransaction(serializedTx);
		console.log('***** signTransaction.resolution', resolution);

		const { r, s, v } = await this.app.signTransaction(hdPath, serializedTx, resolution);

		const txJson = tx.toJSON();
		txJson.v = `0x${v}`;
		txJson.s = `0x${s}`;
		txJson.r = `0x${r}`;
		txJson.type = tx.type;

		console.log('***** signTransaction.txJson', txJson);

		const transaction = TransactionFactory.fromTxData(txJson, {
			common: tx.common,
		});

		console.log('***** signTransaction.hash', transaction.hash().toString('hex'));

		console.log('***** signTransaction.transaction', transaction);

		return transaction;
	};
}
