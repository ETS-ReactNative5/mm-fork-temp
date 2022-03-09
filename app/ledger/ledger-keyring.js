import AppEth from '@ledgerhq/hw-app-eth';
import HDKey from 'hdkey';

const hdPathString = `m/44'/60'/0`;
const type = 'Ledger';
export default class LedgerKeyring {
	static type = type;

	constructor(opts = {}) {
		this.deserialize(opts);
		this.hdk = new HDKey();
	}

	serialize = async () => ({
		hdPath: this.hdPath,
		accounts: this.accounts,
	});

	deserialize = async ({ hdPath, accounts }) => {
		this.hdPath = hdPath || hdPathString;
		this.accounts = accounts || [];
	};

	getAccounts = async () => {
		const accounts = [...this.accounts];
		return accounts;
	};

	addAccounts = async (n = 1) => {
		for (let i = 0; i < n; i++) {
			const path = `m/44'/60'/${i}'/0/0`;
			const address = await this.unlock(path);
			if (!this.accounts.includes(address)) {
				this.accounts.push(address);
			}
		}

		return this.accounts;
	};

	getFirstPage = async () => {
		const page = await this.addAccounts(5);
		return page;
	};

	unlock = async (hdPath) => {
		const address = await this.app.getAddress(hdPath, false, true);
		// eslint-disable-next-line no-undef
		this.hdk.publicKey = Buffer.from(address.publicKey, 'hex');
		// eslint-disable-next-line no-undef
		this.hdk.chainCode = Buffer.from(address.chainCode, 'hex');
		return address;
	};

	setTransport = (transport) => {
		this.transport = transport;
		this.app = new AppEth(this.transport);
	};
}
