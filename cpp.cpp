#include <bits/stdc++.h>
#include <vector>
using namespace std;
int main()
{
    char s, q;
    int a, b, c;
    cin >> a >> s >> b >> q >> c;
    if (s == '+')
    {
        if (a + b == c)
            cout << "Yes";
        else
        {
            cout << a + b;
        }
    }
    else if (s == '-')
    {
        if (a - b == c)
            cout << "Yes";
        else
        {
            cout << a - b;
        }
    }
    else if (s == '*')
    {
        if (a * b == c)
            cout << "Yes";
        else
        {
            cout << a * b;
        }
    }
}