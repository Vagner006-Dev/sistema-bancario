import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useExigirSessao } from '../lib/sessao';
import { formatarMT, formatarData } from '../lib/formato';

export default function ComprovativoScreen() {

useExigirSessao();

const {
  banco,
  referencia,
  estado,
  contaOrigem,
  contaDestino,
  valor,
  dataHora,
} = useLocalSearchParams<{
  banco: string;
  referencia: string;
  estado: string;
  contaOrigem: string;
  contaDestino: string;
  valor: string;
  dataHora: string;
}>();

return (

<View style={styles.container}>

  <View style={styles.cartao}>

    <Text style={styles.logo}>{banco || 'BancoMobile'}</Text>

    <Text style={styles.sucesso}>
      {estado === 'CONCLUIDA' ? 'Transferência concluída!' : 'Transferência ' + String(estado).toLowerCase()}
    </Text>

    <Text style={styles.descricao}>Comprovativo de transferência</Text>

    <View style={styles.linha}>
      <Text style={styles.label}>Referência</Text>
      <Text style={styles.valor}>{referencia}</Text>
    </View>

    <View style={styles.linha}>
      <Text style={styles.label}>Conta de origem</Text>
      <Text style={styles.valor}>{contaOrigem}</Text>
    </View>

    <View style={styles.linha}>
      <Text style={styles.label}>Conta de destino</Text>
      <Text style={styles.valor}>{contaDestino}</Text>
    </View>

    <View style={styles.linha}>
      <Text style={styles.label}>Valor</Text>
      <Text style={styles.valor}>{formatarMT(valor ?? '')}</Text>
    </View>

    <View style={styles.linha}>
      <Text style={styles.label}>Data</Text>
      <Text style={styles.valor}>{formatarData(dataHora)}</Text>
    </View>

  </View>

  <TouchableOpacity
    style={styles.botao}
    onPress={() => router.replace('/dashboard')}
  >
    <Text style={styles.textoBotao}>VOLTAR AO INÍCIO</Text>
  </TouchableOpacity>

</View>

);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#F1F8F4',
justifyContent: 'center',
padding: 25,
},
cartao: {
backgroundColor: '#FFFFFF',
borderRadius: 15,
padding: 22,
},
logo: {
color: '#14532D',
fontSize: 25,
fontWeight: 'bold',
textAlign: 'center',
marginBottom: 25,
},
sucesso: {
color: '#15803D',
fontSize: 21,
fontWeight: 'bold',
textAlign: 'center',
},
descricao: {
color: '#64748B',
textAlign: 'center',
marginTop: 8,
marginBottom: 25,
},
linha: {
borderBottomWidth: 1,
borderBottomColor: '#E5E7EB',
paddingVertical: 15,
},
label: {
color: '#64748B',
fontSize: 13,
},
valor: {
color: '#14532D',
fontSize: 16,
fontWeight: 'bold',
marginTop: 5,
},
aviso: {
color: '#B45309',
backgroundColor: '#FEF3C7',
padding: 12,
borderRadius: 8,
marginTop: 20,
fontSize: 12,
},
botao: {
backgroundColor: '#15803D',
height: 55,
borderRadius: 10,
justifyContent: 'center',
alignItems: 'center',
marginTop: 25,
},
textoBotao: {
color: '#FFFFFF',
fontWeight: 'bold',
},
});
