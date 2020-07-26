import React, { Component } from 'react'
import {
	Panel,
	Placeholder,
	Button
} from '@vkontakte/vkui'
import IconDoNotDisturbOutline from '@vkontakte/icons/dist/56/do_not_disturb_outline'

export default class Error_403 extends Component {

	render () {
		const { navigate } = this.props

		return (
			<Panel id="error_403">
				<Placeholder icon={<IconDoNotDisturbOutline />}
										 header="Ошибка"
										 action={<Button size="l" onClick={() => navigate('loading')}>Попробовать снова</Button>}
										 stretched>
					Ошибка авторизации
				</Placeholder>
			</Panel>
		)
	}
}
