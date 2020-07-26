import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
	Panel,
	Placeholder,
	Spinner
} from '@vkontakte/vkui'
import { socket } from '../server'
import { actions } from '../store'
import { setGame } from '../game'
import bridge from "@vkontakte/vk-bridge";

export class Loading extends Component {

	componentDidMount () {
		const { storageUpdate, userUpdate, navigate, finish } = this.props

		finish(false)
		navigate('launch')

		bridge.send("VKWebAppGetUserInfo").then((data) => {
			userUpdate(data)
			socket.emit('core/init', { ...data, params: window.location.href.split('?')[1].split('#')[0] })
		})

		socket.on('connect', () => {
			console.log('Connected!')
		})
		socket.on('core/ready', async (data) => {
			userUpdate({
				words: data.words,
				socket: data.socket,
				connected: true
			})
			storageUpdate({ connected: true })
			setTimeout(() => {
				if (window.location.href.split('#')[1]) {
					socket.emit('core/join', window.location.href.split('#')[1])
				} else {
					navigate(data.new ? 'launch' : 'main')
				}
			}, 500)
		})
		socket.on('core/joined', (opponent) => {
			storageUpdate({ activeModal: null, stop: false, opponent })
		})

		socket.on('game/start', (data) => {
			const { loading } = this.props
			setGame(data)
			loading(false)
			navigate('game')
			storageUpdate({
				stop: false,
				extraWords: [],
				refreshing: false
			})
			if (window.location.href.split('#')[0]) {
				storageUpdate({ opponent: window.location.href.split('#')[1] })
				window.history.pushState("", document.title, window.location.href.split('#')[0]);
			}
		})
		socket.on('game/finish', (data) => {
			userUpdate({ words: data.words })
			storageUpdate({ stop: true, hasWords: false })
			finish(true)
		})

		socket.on('core/error', (data) => {
			console.warn(data)
			if (window.location.href.split('#')[0]) {
				window.history.pushState("", document.title, window.location.href.split('#')[0]);
			}
			storageUpdate({ activeModal: null, stop: false, opponent: undefined })
			if (data.code === 403) {
				navigate('error_403')
			}
			if (data.code === 404) {
				navigate('main')
			}
			if (data.code === 405) {
				navigate('main')
			}
			if (data.code === 420) {
				navigate('main')
			}
			if (data.code === 422) {
				navigate('main')
			}
		})
		socket.on('disconnect', () => {
			navigate('error_disconnect')
			storageUpdate({
				activeModal: null
			})
		})
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
