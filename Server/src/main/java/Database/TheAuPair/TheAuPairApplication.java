package Database.TheAuPair;

import Database.TheAuPair.Repositories.*;
import Database.TheAuPair.Controllers.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TheAuPairApplication implements CommandLineRunner
{
  private final UserRepository ur;
  private final ParentRepository pr;
  private final medAidRepository mr;
  private final ChildRepository cr;
  private final ActivityRepository ar;
  private final auPairRepository apr;

  private final UserController uc;
  private final ParentController pc;
  private final medAidController mc;
  private final ChildController cc;
  private final ActivityController ac;
  private final auPairController apc;

  @Autowired
  public TheAuPairApplication(UserRepository ur, ParentRepository pr, medAidRepository mr, ChildRepository cr, ActivityRepository ar, auPairRepository apr)
  {
    this.ur = ur;
    this.pr = pr;
    this.mr = mr;
    this.cr = cr;
    this.ar = ar;
    this.apr = apr;
    uc = new UserController(this.ur);
    pc = new ParentController(this.pr);
    mc = new medAidController(this.mr);
    cc = new ChildController(this.cr);
    ac = new ActivityController(this.ar);
    apc = new auPairController(this.apr);
  }

  public static void main(String[] args)
  {
    SpringApplication.run(TheAuPairApplication.class, args);
  }

  @Override
  public void run(String... args) throws Exception
  {
  }
}
