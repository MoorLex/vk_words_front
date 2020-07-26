import React, { Component } from 'react'
import {
	Panel,
	Placeholder,
	Button
} from '@vkontakte/vkui'
import IconDoNotDisturbOutline from '@vkontakte/icons/dist/56/do_not_disturb_outline'

export default class Error_Disconnect extends Component {

	reconnect () {
		window.location.reload()
	}

	render () {
		return (
			<Panel id="error_disconnect">
				<Placeholder icon={<IconDoNotDisturbOutline />}
										 header="Ошибка"
										 action={<Button size="l" onClick={() => this.reconnect()}>Подключиться снова</Button>}
										 stretched>
					Связь потеряна
				</Placeholder>
			</Panel>
		)
	}
}
