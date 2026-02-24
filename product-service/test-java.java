import java.net.Socket;
public class test {
    public static void main(String[] args) {
        try {
            Socket s = new Socket("localhost", 5433);
            System.out.println("Port 5433 is open");
            s.close();
        } catch (Exception e) {
            System.out.println("Port 5433 is closed: " + e.getMessage());
        }
    }
}
