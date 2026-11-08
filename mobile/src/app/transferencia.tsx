import { useState } from 'react';
import {
View,
Text,
TextInput,
TouchableOpacity,
StyleSheet,
Alert,
ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { transferir as transferirApi, mostrarErro } from '../lib/api';
import { sessao, useExigirSessao } from '../lib/sessao';

export default function TransferenciaScreen() {

useExigirSessao();

const [contaDestino, setContaDestino] = useState('');
const [valor, setValor] = useState('');
const [pin, setPin] = useState('');
const [carregando, setCarregando] = useState(false);

async function transferir() {

if (!contaDestino || !valor || !pin) {
Alert.alert('Atenção', 'Preencha todos os campos.');
return;
}

if (!/^\d+$/.test(contaDestino)) {
  Alert.alert('Erro', 'Introduza um número de conta válido.');
  return;
}

if (!/^\d+([.,]\d{1,2})?$/.test(valor) || Number(valor.replace(',', '.')) <= 0) {
  Alert.alert('Erro', 'Introduza um valor válido (até 2 casas decimais).');
  return;
}

if (!/^\d{4}$/.test(pin)) {
  Alert.alert('Erro', 'O PIN deve ter 4 dígitos.');
  return;
}

setCarregando(true);
try {
  const c = await transferirApi(contaDestino, Number(valor.replace(',', '.')), pin);

  router.replace({
    pathname: '/comprovativo',
    params: {
      banco: c.banco,
      referencia: c.referencia,
      estado: c.estado,
      contaOrigem: c.contaOrigem ?? '',
      contaDestino: c.contaDestino,
      valor: String(c.valor),
      dataHora: c.dataHora,
    },
  });
} catch (e) {
  mostrarErro(e, 'Transferência não realizada');
  setPin('');
} finally {
  setCarregando(false);
}

}

return (

<View style={styles.container}>

  <Text style={styles.logo}>BancoMobile</Text>

  <Text style={styles.titulo}>Transferências</Text>

  <Text style={styles.descricao}>
    Conta de origem: {sessao.numero}
  </Text>

  <Text style={styles.label}>Conta de destino</Text>

  <TextInput
    style={styles.input}
    placeholder="Número da conta de destino"
    keyboardType="numeric"
    value={contaDestino}
    onChangeText={setContaDestino}
  />

  <Text style={styles.label}>Valor da transferência (MT)</Text>

  <TextInput
    style={styles.input}
    placeholder="Ex.: 1000"
    keyboardType="decimal-pad"
    value={valor}
    onChangeText={setValor}
  />

  <Text style={styles.label}>PIN de confirmação</Text>

  <TextInput
    style={styles.input}
    placeholder="Introduza o seu PIN"
    keyboardType="numeric"
    secureTextEntry
    maxLength={4}
    value={pin}
    onChangeText={setPin}
  />

  <TouchableOpacity
    style={[styles.botao, carregando && { opacity: 0.7 }]}
    onPress={transferir}
    disabled={carregando}
  >
    {carregando ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.textoBotao}>TRANSFERIR</Text>
    )}
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.botaoVoltar}
    onPress={() => router.back()}
    disabled={carregando}
  >
    <Text style={styles.textoVoltar}>VOLTAR</Text>
  </TouchableOpacity>

</View>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#F1F8F4',
padding: 25,
justifyContent: 'center',
},
logo: {
color: '#14532D',
fontSize: 25,
fontWeight: 'bold',
textAlign: 'center',
marginBottom: 35,
},
titulo: {
fontSize: 27,
fontWeight: 'bold',
color: '#14532D',
},
descricao: {
color: '#64748B',
marginTop: 8,
marginBottom: 30,
},
label: {
color: '#14532D',
fontWeight: '600',
marginBottom: 8,
},
input: {
backgroundColor: '#FFFFFF',
height: 55,
borderRadius: 10,
paddingHorizontal: 15,
borderWidth: 1,
borderColor: '#D1D5DB',
marginBottom: 22,
},
botao: {
backgroundColor: '#15803D',
height: 55,
borderRadius: 10,
justifyContent: 'center',
alignItems: 'center',
marginTop: 10,
},
textoBotao: {
color: '#FFFFFF',
fontWeight: 'bold',
fontSize: 16,
},
botaoVoltar: {
padding: 15,
alignItems: 'center',
marginTop: 10,
},
textoVoltar: {
color: '#14532D',
fontWeight: 'bold',
},
});
