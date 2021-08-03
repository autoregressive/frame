import React from 'react'
import Restore from 'react-restore'
import utils from 'web3-utils'
import svg from '../../../../../../../resources/svg'
import link from '../../../../../../../resources/link'

const SimpleJSON = ({ json, key = '_base' }) => {
  return (
    <div className='simpleJson'>
      {Object.keys(json).map((key, o) => (
        <div key={key + o} className='simpleJsonChild'>
          <div className='simpleJsonKey'>{key}:</div>
          <div className='simpleJsonValue'>
            {typeof json[key] === 'object' ? (
              <SimpleJSON json={json[key]} key={key} />
            ) : (
              json[key]
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

class TransactionRequest extends React.Component {
  constructor (...args) {
    super(...args)
    this.state = { allowInput: false, dataView: false }
    setTimeout(() => {
      this.setState({ allowInput: true })
    }, 2000)
  }

  copyAddress (e) {
    e.preventDefault()
    e.target.select()
    document.execCommand('Copy')
    this.setState({ copied: true })
    setTimeout(_ => this.setState({ copied: false }), 1000)
  }

  approve (reqId, req) {
    link.rpc('approveRequest', req, () => {}) // Move to link.send
  }

  decline (reqId, req) {
    link.rpc('declineRequest', req, () => {}) // Move to link.send
  }

  toggleDataView (id) {
    this.setState({ dataView: !this.state.dataView })
  }

  hexToDisplayValue (hex) {
    return (Math.round(parseFloat(utils.fromWei(hex, 'ether')) * 1000000) / 1000000).toFixed(6)
  }

  render () {
    const type = this.props.req.type
    const status = this.props.req.status
    const notice = this.props.req.notice
    const payload = this.props.req.payload
    const typedData = payload.params[1] || {}

    let requestClass = 'signerRequest'
    if (status === 'success') requestClass += ' signerRequestSuccess'
    if (status === 'declined') requestClass += ' signerRequestDeclined'
    if (status === 'pending') requestClass += ' signerRequestPending'
    if (status === 'error') requestClass += ' signerRequestError'
    const mode = this.props.req.mode
    const height = mode === 'monitor' ? '80px' : '340px'
    return (
      <div key={this.props.req.id || this.props.req.handlerId} className={requestClass} style={{ transform: `translateY(${this.props.pos}px)`, height }}>
        {type === 'signTypedData' ? (
          <div className='approveRequest'>
            <div className='approveTransactionPayload'>
              {notice ? (
                <div className='requestNotice'>
                  {(_ => {
                    if (status === 'pending') {
                      return (
                        <div key={status} className='requestNoticeInner bounceIn'>
                          <div style={{ paddingBottom: 20 }}><div className='loader' /></div>
                          <div className='requestNoticeInnerText'>See Signer</div>
                          <div className='cancelRequest' onMouseDown={() => this.decline(this.props.req.handlerId, this.props.req)}>Cancel</div>
                        </div>
                      )
                    } else if (status === 'success') {
                      return (
                        <div key={status} className='requestNoticeInner bounceIn'>
                          <div>{svg.octicon('check', { height: 80 })}</div>
                          <div className='requestNoticeInnerText'>{notice}</div>
                        </div>
                      )
                    } else if (status === 'error' || status === 'declined') {
                      return (
                        <div key={status} className='requestNoticeInner bounceIn'>
                          <div className='requestNoticeInnerText'>{notice}</div>
                        </div>
                      )
                    } else {
                      return <div key={notice} className='requestNoticeInner bounceIn'>{notice}</div>
                    }
                  })()}
                </div>
              ) : (
                <>
                  <div className='approveRequestHeader approveTransactionHeader'>
                    <div className='approveRequestHeaderIcon'> {svg.octicon('pencil', { height: 20 })}</div>
                    <div className='approveRequestHeaderLabel'> Sign Message</div>
                  </div>
                  <div className='signTypedData'>
                    <div className='signTypedDataInner'>
                      <div className='signTypedDataSection'>
                        <div className='signTypedDataTitle'>Domain</div>
                        <SimpleJSON json={typedData.domain} />
                      </div>
                      <div className='signTypedDataSection'>
                        <div className='signTypedDataTitle'>Message</div>
                        <SimpleJSON json={typedData.message} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className='unknownType'>{'Unknown: ' + this.props.req.type}</div>
        )}
        <div className='requestApprove'>
          <div 
            className='requestDecline' 
            style={{ pointerEvents: this.state.allowInput && this.props.onTop ? 'auto' : 'none'}} 
            onClick={() => { if (this.state.allowInput && this.props.onTop) this.decline(this.props.req.handlerId, this.props.req) 
          }}>
            <div className='requestDeclineButton _txButton _txButtonBad'>Decline</div>
          </div>
          <div 
            className='requestSign' 
            style={{ pointerEvents: this.state.allowInput && this.props.onTop ? 'auto' : 'none'}}
            onClick={() => { if (this.state.allowInput && this.props.onTop) this.approve(this.props.req.handlerId, this.props.req) 
          }}>
            <div className='requestSignButton _txButton'>Sign</div>
          </div>
        </div>
      </div>
    )
  }
}

export default Restore.connect(TransactionRequest)
