package co.mz.bank.transaccoes.exception;

public class ErroContasException extends RuntimeException {

    private final int status;

    public ErroContasException(int status, String mensagem){
        super(mensagem);
        this.status = status;

    }

    public int getStatus(){return status;}

}
