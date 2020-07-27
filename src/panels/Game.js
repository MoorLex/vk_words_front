import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
	Panel,
	PanelHeader,
	PanelHeaderBack,
	Avatar,
	Snackbar
} from '@vkontakte/vkui'
import IconRefreshOutline from '@vkontakte/icons/dist/28/refresh_outline'
import IconWaterDropOutline from '@vkontakte/icons/dist/28/water_drop_outline'
import IconUserAddOutline from '@vkontakte/icons/dist/28/user_add_outline'
import IconUser from '@vkontakte/icons/dist/24/user'
import Canvas from '../components/Canvas'
import { game } from '../game'
import { actions } from '../store'
import { socket } from '../server'

export class Game extends Component {
	canvas

	constructor(props) {
		super(props);

		this.state = {
			snackbar: null
		}
	}

	componentDidMount () {
		const { storageUpdate } = this.props
		document.body.style.overflow = 'hidden'
		storageUpdate({ extraWords: [], hasWords: false })

		socket.on('opponent/disconnected', () => {
			this.onUserDisconnect()
		})
	}

	componentWillUnmount () {
		document.body.style.overflow = 'auto'
		socket.removeAllListeners('opponent/disconnected')
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
		const { storageUpdate } = this.props
		storageUpdate({ activeModal: 'words-modal', stop: true })
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

	invite () {
		const { storageUpdate } = this.props
		storageUpdate({ activeModal: 'modal-invite', stop: true })
	}

	close () {
		const { navigate } = this.props
		socket.emit('core/reset')
		navigate("main")
	}

	BtnRandomize () {
		return (
			<div style={{ ...styles.btn, right: '20px' }}
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
			<div style={{ ...styles.btn, left: '20px' }}
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
			<div style={{ ...styles.btn, bottom: '70px', right: '20px' }}
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

	render () {
		const { storage, storageUpdate } = this.props
		const { snackbar } = this.state

		return (
			<Panel id="game">
				<PanelHeader left={<PanelHeaderBack onClick={() => this.close()} />}>
					Игра
				</PanelHeader>
				{!storage.refreshing ? (
					<Canvas ref={(ref) => this.canvas = ref}
									game={game}
									stop={storage.stop}
									theme={storage.theme}
									findExtraWord={(word) => this.findExtraWord(word)}
									findWord={() => storageUpdate({ hasWords: true })}
									onSubmit={(word) => this.onSubmit(word)} />
				) : null}
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
	const { user, storage } = state
	return { user, storage }
}
export default connect(mapStateToProps, actions)(Game)
