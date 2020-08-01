import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
	Panel,
	PanelHeader,
	PanelHeaderBack,
	Avatar,
	Subhead,
	Snackbar
} from '@vkontakte/vkui'
import vkQr from '@vkontakte/vk-qr';
import IconRefreshOutline from '@vkontakte/icons/dist/28/refresh_outline'
import IconWaterDropOutline from '@vkontakte/icons/dist/28/water_drop_outline'
import IconUserAddOutline from '@vkontakte/icons/dist/28/user_add_outline'
import IconUser from '@vkontakte/icons/dist/24/user'
import Canvas from '../components/Canvas'
import { game } from '../game'
import { actions, onBlur } from '../store'
import { socket } from '../server'

export class Game extends Component {
	canvas

	constructor(props) {
		super(props);

		this.state = {
			snackbar: null,
			points: {}
		}
	}

	componentDidMount () {
		const { storageUpdate, closeModal, storage } = this.props
		document.body.style.overflow = 'hidden'
		storageUpdate({ extraWords: [], hasWords: false })

		window.addEventListener('blur', () => onBlur());

		socket.on('game/pints', (points) => {
			this.setState({ points })
		})
		socket.on('opponent/joined', (opponent) => {
			const modalRoot = document.querySelector('.ModalRoot')
			if (modalRoot && !modalRoot.classList.contains('ModalRoot--touched')) {
				closeModal()
			}
			storageUpdate({ opponent })
			setTimeout(() => this.onUserJoined(opponent.user_name), 500)
		})
		socket.on('opponent/disconnected', () => {
			if (!storage.hasWords) {
				storageUpdate({ opponent: undefined })
			}
			this.onUserDisconnect()
		})
	}

	componentWillUnmount () {
		document.body.style.overflow = 'auto'
		window.removeEventListener('blur', () => onBlur());
		socket.removeAllListeners('opponent/joined')
		socket.removeAllListeners('opponent/disconnected')
	}

	onUserJoined (name) {
		if (this.state.snackbar) return;

		this.setState({ snackbar:
				<Snackbar layout="vertical"
									onClose={() => this.setState({ snackbar: null })}
									before={<Avatar size={24} style={{ backgroundColor: 'var(--accent)' }}>
										<IconUser fill="#fff" width={14} height={14} />
									</Avatar>}>
					{name} подключился(-лась) к игре
				</Snackbar>
		});
	}

	onUserDisconnect () {
		if (this.state.snackbar) return;

		this.setState({ snackbar:
				<Snackbar layout="vertical"
									onClose={() => this.setState({ snackbar: null })}
									before={<Avatar size={24} style={{ backgroundColor: 'var(--destructive)' }}>
										<IconUser fill="#fff" width={14} height={14} />
									</Avatar>}>
					Ваш противник покинул игру
				</Snackbar>
		});
	}

	onRandomize () {
		this.canvas.randomizeCharsCircle()
	}

	onShowWords () {
		const { showWordsModal, storage } = this.props
		showWordsModal(storage.extraWords)
	}

	onSubmit (word) {
		socket.emit('game/word/check', { word })
	}

	findExtraWord (word) {
		const {storageAddWord, storage} = this.props

		if (!storage.extraWords.includes(word)) {
			storageAddWord(word)
		}
	}

	onFind (word) {
		const { points } = this.state
		const { storageUpdate } = this.props

		storageUpdate({ hasWords: true })

		if (points[word.isOpen]) {
			points[word.isOpen]++
			this.setState({ points })
		} else {
			points[word.isOpen] = 1
			this.setState({ points })
		}
	}

	invite () {
		const { showInviteModal, user, storage } = this.props
		const link = 'https://vk.com/app7500339/#' + user.socket
		const foregroundColor = storage.theme === 'light' ? '#aeb7c2' : '#5d5f61'
		const qrSvg = vkQr.createQR(link, {
			ecc: 2,
			qrSize: 256,
			logoColor: '#6358b8',
			foregroundColor,
			isShowLogo: true
		});

		const buff = new Buffer(qrSvg);
		const qr = buff.toString('base64');

		showInviteModal({ qr, link })
	}

	close () {
		const { navigate } = this.props
		socket.emit('core/reset')
		navigate("main")
	}

	BtnRandomize () {
		return (
			<div style={{ ...styles.btn, right: 20 }}
					 onClick={() => this.onRandomize()}>
				<Avatar style={{ background: 'var(--accent)' }}
								size={36}
								shadow={false}>
					<IconRefreshOutline width={28}
															height={28}
															fill="var(--white)" />
				</Avatar>
			</div>
		)
	}

	BtnWords () {
		const { storage } = this.props

		return (
			<div style={{ ...styles.btn, left: 20 }}
					 onClick={() => this.onShowWords()}>
				<Avatar style={{ background: 'var(--accent)' }}
								size={36}
								shadow={false}>
					<IconWaterDropOutline width={28}
																height={28}
																fill="var(--white)" />
					<span style={styles.btnOverlay}>{storage.extraWords.length}</span>
				</Avatar>
			</div>
		)
	}

	BtnInvite () {
		const { storage } = this.props
		if ((storage.hasWords ? true : storage.opponent)) return null

		return (
			<div style={{ ...styles.btn, bottom: 70, right: 20 }}
					 onClick={() => this.invite()}>
				<Avatar style={{ background: 'var(--accent)' }}
								size={36}
								shadow={false}>
					<IconUserAddOutline width={24}
															height={24}
															fill="var(--white)" />
				</Avatar>
			</div>
		)
	}

	labelUser (type = 'user') {
		const { points } = this.state
		const { storage, user } = this.props
		const style = { ...styles.btn, ...styles.label, bottom: '25%' }
		let data = {}

		if (!storage.opponent) return null

		if (type === 'user') {
			style.left = 20
			data = user
			data.color = game.color
		} else {
			style.right = 20
			style.flexDirection = 'row-reverse'
			data = storage.opponent
		}

		style.background = data.color

		return (
			<div style={{ ...style, background: data.color }}>
				<Avatar src={data.user_avatar}
								size={20}/>
				<Subhead weight="bold"
								 style={{ marginLeft: 7, marginRight: 7, color: '#fff' }}>
					{points[data.user_id] || 0} / {game.words.length}
				</Subhead>
			</div>
		)
	}

	render () {
		const { storage, modals, popup } = this.props
		const { snackbar } = this.state

		return (
			<Panel id="game" style={{ overflow: 'hidden' }}>
				<PanelHeader left={<PanelHeaderBack onClick={() => this.close()} />}>
					Игра
				</PanelHeader>
				{!storage.refreshing ? (
					<Canvas ref={(ref) => this.canvas = ref}
									game={game}
									stop={modals.active || popup || storage.isBlur}
									theme={storage.theme}
									findExtraWord={(word) => this.findExtraWord(word)}
									findWord={(word) => this.onFind(word)}
									onSubmit={(word) => this.onSubmit(word)} />
				) : null}
				{this.labelUser('user')}
				{this.labelUser('opponent')}
				{this.BtnRandomize()}
				{this.BtnWords()}
				{this.BtnInvite()}
				{snackbar}
			</Panel>
		)
	}
}

const styles = {
	btn: {
		zIndex: 1,
		bottom: '20px',
		position: 'fixed'
	},
	label: {
		padding: 5,
		display: 'flex',
		borderRadius: 50,
		alignItems: 'center'
	},
	btnOverlay: {
		left: 0,
		right: 0,
		bottom: 0,
		top: '2px',
		display: 'flex',
		fontSize: '10px',
		position: 'absolute',
		alignItems: 'center',
		color: 'var(--white)',
		justifyContent: 'center'
	}
}

const mapStateToProps = (state) => {
	const { user, modals, storage, popup } = state
	return { user, modals, storage, popup }
}
export default connect(mapStateToProps, actions)(Game)
