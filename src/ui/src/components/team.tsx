import * as React from "react";
import {Card, CardGroup, Container} from "react-bootstrap";

const Team = () => {

    
    return <>
     <Container fluid className="darken">
        <h1>Team</h1>
        <p>At crypto is good we don't belive in titles. The most important thing you need to know about us is that we are all developers</p>
        <CardGroup>
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
      </Card>
      <Card>
        <Card.Img variant="top" src="jonathan.jpeg" />
        <Card.Body>
          <Card.Title>Jonathan Green</Card.Title>
          <Card.Text>
          Software Engineer and blockchain developer with over 10 years of experience
          </Card.Text>
          <a href="https://twitter.com/ALLiDoizCode">Twitter</a>
        </Card.Body>
      </Card>
      <Card>
        <Card.Img variant="top" src="notdom.jpeg" />
        <Card.Body>
          <Card.Title>Not Dom</Card.Title>
          <Card.Text>
          Not the Chief Scientist Officer of dfinity.
          </Card.Text>
          <a href="https://twitter.com/notdomwilliams">Twitter</a>
        </Card.Body>
      </Card>
    </CardGroup>
     </Container>
    </>
    
}

export default Team