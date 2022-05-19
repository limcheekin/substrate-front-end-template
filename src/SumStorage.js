import React, { useEffect, useState } from 'react'
import { Form, Input, Grid, Card, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

function Main(props) {
  const { api } = useSubstrateState()
  // The transaction submission status
  const [status, setStatus] = useState('')

  const [thing1, setThing1] = useState(0)
  const [thing1Input, setThing1Input] = useState(0)
  const [thing2, setThing2] = useState(0)
  const [thing2Input, setThing2Input] = useState(0)
  const [sum, setSum] = useState(0)

  useEffect(() => {
    let unsubscribe
    api.queryMulti([
      api.query.sumStorage.thing1,
      api.query.sumStorage.thing2
    ], ([getThing1, getThing2]) => {
      console.log(`getThing1: ${getThing1}, getThing2: ${getThing2}`);
      setThing1(getThing1.toNumber())
      setThing2(getThing2.toNumber())
    }).then(unsub => {
      unsubscribe = unsub
    })
    .catch(console.error)
    return () => unsubscribe && unsubscribe()
  }, [api, api.query.sumStorage])


  useEffect(() => {
    let unsubscribe
      api.rpc.sumStorage.getSum(value => {
          setSum(value.toNumber())
      })
      .then(unsub => {
        unsubscribe = unsub
      })
      .catch(console.error)
  
    return () => unsubscribe && unsubscribe()
  }, [api.rpc.sumStorage, thing1, thing2])

  return (
    <Grid.Column width={8}>
      <h1>Sum Storage</h1>
      <Card centered>
        <Card.Content textAlign="center">
          <Statistic label="Thing1" value={thing1} />
        </Card.Content>
        <Card.Content textAlign="center">
          <Statistic label="Thing2" value={thing2} />
        </Card.Content>
        <Card.Content textAlign="center">
          <Statistic label="Sum" value={sum} />
        </Card.Content>
      </Card>
      <Form>
        <Form.Field>
          <Input
            label="Thing1"
            state="newValue"
            type="number"
            onChange={(_, { value }) => setThing1Input(value)}
          />
          <Input
            label="Thing2"
            state="newValue"
            type="number"
            onChange={(_, { value }) => setThing2Input(value)}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            label="Set Thing 1"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'sumStorage',
              callable: 'setThing1',
              inputParams: [thing1Input],
              paramFields: [true],
            }}
          />
          <TxButton
            label="Set Thing 2"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'sumStorage',
              callable: 'setThing2',
              inputParams: [thing2Input],
              paramFields: [true],
            }}
          />
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}

export default function SumStorage(props) {
  const { api } = useSubstrateState()
  return api.query.sumStorage && 
    api.rpc.sumStorage.getSum ? (
    <Main {...props} />
  ) : null
}
