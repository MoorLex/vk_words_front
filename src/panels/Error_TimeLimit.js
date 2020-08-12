import React, { Component } from 'react'
import {
	Panel,
	Placeholder
} from '@vkontakte/vkui'
import IconDoNotDisturbOutline from '@vkontakte/icons/dist/56/do_not_disturb_outline'

export default class Error_TimeLimit extends Component {

	reconnect () {
		window.location.reload()
	}

	render () {
		return (
			<Panel id="error_timeLimit">
				<Placeholder icon={<IconDoNotDisturbOutline />}
										 header="Что то пошло не так"
										 stretched>
					Попробуйте перезапустить сервис очистив кэш
				</Placeholder>
			</Panel>
		)
	}
}
