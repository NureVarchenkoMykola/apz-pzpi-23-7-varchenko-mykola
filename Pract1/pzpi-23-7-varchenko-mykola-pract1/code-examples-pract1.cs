namespace code_examples_pract1
{
    public interface IState
    {
        void Handle(Context context);
    }

    public class Context
    {
        private IState _state;

        public void SetState(IState state)
        {
            _state = state;
        }

        public void Request()
        {
            _state.Handle(this);
        }
    }

    public class ReadyState : IState
    {
        public void Handle(Context context)
        {
            Console.WriteLine("Player is ready");
            context.SetState(new PlayingState());
        }
    }

    public class PlayingState : IState
    {
        public void Handle(Context context)
        {
            Console.WriteLine("Music is playing");
            context.SetState(new LockedState());
        }
    }

    public class LockedState : IState
    {
        public void Handle(Context context)
        {
            Console.WriteLine("Player is locked");
        }
    }

    internal class Program
    {
        static void Main(string[] args)
        {
            Context player = new Context();
            player.SetState(new ReadyState());
            player.Request();
            player.Request();
            Console.ReadKey();
        }
    }
}