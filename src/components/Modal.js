import React, { Component } from 'react'
import { connect } from 'react-redux'
import bridge from '@vkontakte/vk-bridge'
import {
  ModalRoot,
  ModalCard,
  ModalPage,
  ModalPageHeader,
  PanelHeaderButton,
  Button,
  Placeholder,
  Avatar,
  Div
} from '@vkontakte/vkui'
import vkQr from '@vkontakte/vk-qr';
import IconServicesOutline from '@vkontakte/icons/dist/56/services_outline'
import IconDismiss from '@vkontakte/icons/dist/24/dismiss'
import { actions } from '../store'

export class Modals extends Component {
  onClose () {
    const { activeModal, storageUpdate, onClose } = this.props
    if (activeModal === 'finish-modal') {
      storageUpdate({
        stop: false,
        activeModal: null
      })
      onClose()
    } else {
      storageUpdate({ stop: false })
    }
  }

  onHide () {
    const { storageUpdate } = this.props
    storageUpdate({
      stop: false,
      activeModal: null
    })
  }

  ModalInvite () {
    const {  user } = this.props
    const qrSvg = vkQr.createQR('https://vk.com/app7500339/#' + user.socket, {
      qrSize: 256,
      isShowLogo: true
    });

    const buff = new Buffer(qrSvg);
    const base64data = buff.toString('base64');

    return (
      <ModalCard id="modal-invite"
                 onClose={() => this.onHide()}
                 icon={<Avatar size={150}
                               mode="image"
                               shadow={false}
                               style={{ background: 'var(--white)' }}
                               src={`data:image/svg+xml;base64,${base64data}`} />}
                 header="Играйте вместе!"
                 caption={'https://vk.com/app7500339/#' + user.socket}
                 actions={[{
                   title: 'Поделиться ссылкой',
                   mode: 'primary',
                   action: () => {
                     bridge.send("VKWebAppShare", {"link": 'https://vk.com/app7500339/#' + user.socket});
                   }
                 }]}
                 actionsLayout="vertical" />
    )
  }

  ModalTutorial1 () {
    const { storageUpdate } = this.props
    const close = () => {
      storageUpdate({
        stop: false,
        activeModal: null,
        wasInGame: true
      })
    }
    return (
      <ModalCard id="tutorial-modal-1"
                 onClose={() => close()}
                 icon={<IconServicesOutline />}
                 header="Добро пожаловать в игру!"
                 caption="Цель игры – заполнить все пустые поля уровня, собирая слова из доступных Вам букв"
                 actions={[{
                   title: 'Продолжить',
                   mode: 'primary',
                   action: () => close()
                 }]}
                 actionsLayout="vertical" />
    )
  }

  ModalWords () {
    const { storage } = this.props

    return (
      <ModalPage id="words-modal"
                 onClose={() => this.onHide()}
                 header={
                   <ModalPageHeader right={<PanelHeaderButton onClick={() => this.onHide()}><IconDismiss /></PanelHeaderButton>}>
                     Дополнительные слова
                   </ModalPageHeader>
                 }>
        {storage.extraWords.length > 0 ? (
          <Div>
            {storage.extraWords.map((word) => (
              <Button style={{ marginRight: '10px', marginBottom: '10px', pointerEvents: 'none' }}
                      key={word}>
                {word}
              </Button>
            ))}
          </Div>
        ) : (
          <Placeholder>Список слов пуст</Placeholder>
        )}
      </ModalPage>
    )
  }

  render () {
    const { activeModal } = this.props
    return (
      <ModalRoot activeModal={activeModal}
                 onClose={() => this.onClose()}>
        {this.ModalTutorial1()}
        {this.ModalWords()}
        {this.ModalInvite()}
      </ModalRoot>
    )
  }
}

const mapStateToProps = (state) => {
  const { storage, user } = state
  return { storage, user }
}
export default connect(mapStateToProps, actions)(Modals)
