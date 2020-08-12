import React, { Component } from 'react'
import { connect } from 'react-redux'
import bridge from '@vkontakte/vk-bridge'
import {
	Panel,
	Placeholder,
	Spinner
} from '@vkontakte/vkui'
import { socket } from '../server'
import { actions } from '../store'
import { setGame, resetGame } from '../game'

export class Loading extends Component {
	timer

	componentDidMount () {
		const { storageUpdate, userUpdate, navigate, closePopup, closeModal } = this.props

		closePopup()
		closeModal()

		const hash = window.location.hash
		window.history.replaceState("", document.title, window.location.href.split('#')[0])

		bridge.send("VKWebAppGetUserInfo").then((data) => {
			userUpdate(data)
			socket.emit('core/init', { ...data, params: window.location.search.slice(1).split('#')[0] })
		})

		if (process.env.REACT_APP_LOCAL_USER_DATA) {
			const data = JSON.parse(process.env.REACT_APP_LOCAL_USER_DATA)
			userUpdate(data)
			socket.emit('core/init', { ...data, params: window.location.search.slice(1) })
		}

		// document.body.setAttribute('scheme', 'space_gray');

		socket.on('core/ready', async (data) => {
			userUpdate({
				...data
			})
			storageUpdate({ connected: true })
			setTimeout(() => {
				let regexp =  /(#game\/)[\w]+/gi
				if (regexp.test(hash)) {
					socket.emit('core/join', hash.split('/')[1])
				} else {
					navigate(data.new ? 'launch' : 'main', true)
				}
			}, 500)
		})

		socket.on('game/start', (data) => {
			setGame(data.game)
			closePopup()
			navigate('game')
			storageUpdate({
				extraWords: [],
				refreshing: false,
				opponent: data.opponent
			})
		})

		socket.on('core/error', (data) => {
			console.warn(data)
			closePopup()
			closeModal()
			resetGame()
			storageUpdate({ activeModal: null, opponent: undefined })
			if (data.code === 403) {
				setTimeout(() => navigate('error_403', true), 800)
			}
			if (data.code === 404) {
				navigate('main', true)
			}
			if (data.code === 405) {
				navigate('main', true)
			}
			if (data.code === 422) {
				navigate('main', true)
			}
		})

		socket.on('error', () => this.onError())
		socket.on('disconnect', () => this.onError())
		socket.on('connect_error', () => this.onError())
		socket.on('reconnect_error', () => this.onError())
		socket.on('reconnect_failed', () => this.onError())
	}

	componentWillUnmount() {
		clearTimeout(this.timer)
	}

	onError () {
		const { navigate, closePopup, closeModal, userUpdate } = this.props

		userUpdate({ socket: undefined })
		navigate('error_disconnect', true)
		resetGame()
		closePopup()
		closeModal()
	}

	render () {
		return (
			<Panel id="loading">
				<Placeholder stretched>
					<Spinner size="large"/>
				</Placeholder>
			</Panel>
		)
	}
}

const mapStateToProps = (state) => {
	const { storage } = state
	return { storage }
}
export default connect(mapStateToProps, actions)(Loading)
