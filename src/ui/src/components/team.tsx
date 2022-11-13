import * as React from "react";
import {Card, CardGroup, Container} from "react-bootstrap";

const Team = () => {
  const [teamArrayCard, setTeamArrayCard] = React.useState(shuffle([
      <Card>
      <Card.Img variant="top" src="cryptoisgood.png" />
      <Card.Body>
        <Card.Title>Daniel Andrade</Card.Title>
        <Card.Text>
          Influencer with over 150,000 followers across all social media. Software Engineer and architect with over 12 years of experience.
           Experience doing marketing and community management.
        </Card.Text>
        <a href="https://twitter.com/crypto_is_good">Twitter</a>
      </Card.Body>
    </Card>,
          <Card>
          <Card.Img variant="top" src="jonathan.jpeg" />
          <Card.Body>
            <Card.Title>Jonathan Green</Card.Title>
            <Card.Text>
            Software Engineer and blockchain developer with over 10 years of experience
            </Card.Text>
            <a href="https://twitter.com/ALLiDoizCode">Twitter</a>
          </Card.Body>
        </Card>,
              <Card>
              <Card.Img variant="top" src="notdom.jpeg" />
              <Card.Body>
                <Card.Title>Not Dom</Card.Title>
                <Card.Text>
                Not the Chief Scientist Officer of dfinity.
                </Card.Text>
                <a href="https://twitter.com/notdomwilliams">Twitter</a>
              </Card.Body>
            </Card>,
                  <Card>
                  <Card.Img variant="top" src="remco.jpeg" />
                  <Card.Body>
                    <Card.Title>Remco</Card.Title>
                    <Card.Text>
                      Crypto Enthusiast with 10+ years of programming experience. Self proclaimed awesome guy and beer enthusiast.
                    </Card.Text>
                    <a href="https://twitter.com/rem_codes">Twitter</a>
                  </Card.Body>
                </Card>,

      <Card>
      <Card.Img variant="top" src="thecaje.png" />
      <Card.Body>
        <Card.Title>CajunCanadian - Promote.ICP</Card.Title>
        <Card.Text>
          Crypto Enthusiast with 25+ years of B2B sales experience and now helping my ICPFam with Community Management and Business Development
        </Card.Text>
        <a href="https://twitter.com/CajunCanadian_">Twitter</a>
      </Card.Body>
    </Card>

    ]));

    function shuffle(array) {
      let currentIndex = array.length,  randomIndex;
    
      // While there remain elements to shuffle.
      while (currentIndex != 0) {
    
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
    
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }
    
      return array;
    }

    
    return <>
     <Container fluid className="darken">
        <h1>Team</h1>
        <p>At crypto is good we don't belive in titles. The most important thing you need to know about us is that we are all developers except CajunCanadian who will do everything else</p>
      <CardGroup style={{maxWidth: "65%", margin: "auto"}}>
        {teamArrayCard[0]}
        {teamArrayCard[1]}
      </CardGroup>
      <CardGroup style={{maxWidth: "75%", margin: "auto"}}>
        {teamArrayCard[2]}
        {teamArrayCard[3]}
        {teamArrayCard[4]}
      </CardGroup>
     </Container>
    </>
    
}

export default Team