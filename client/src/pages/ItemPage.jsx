import { useParams } from 'react-router-dom';

export default function ItemPage() {
  const { id } = useParams();
  return (
    <section>
      <h1>Item page</h1>
      <p>This will show the item with id: {id}</p>
    </section>
  );
}